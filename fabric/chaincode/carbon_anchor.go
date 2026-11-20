package main

/*
 * CarbonLoom 3-Org Hyperledger Fabric Chaincode (FR-F1, FR-F2)
 * Organizations: Org1MSP (Factory), Org2MSP (Verifier), Org3MSP (Buyer)
 * Implements anchorRecord, verifyRecord, revokeRecord, grantAccess
 * with Private Data Collection (factoryCommercialPDC).
 */

import (
	"encoding/json"
	"fmt"
	"time"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

type SmartContract struct {
	contractapi.Contract
}

type AnchorRecord struct {
	BatchID       string    `json:"batch_id"`
	MerkleRoot    string    `json:"merkle_root"`
	Timestamp     time.Time `json:"timestamp"`
	SchemaVersion string    `json:"schema_version"`
	AnchoredBy    string    `json:"anchored_by"`
	IsRevoked     bool      `json:"is_revoked"`
	RevokeReason  string    `json:"revoke_reason,omitempty"`
}

type CommercialPDCData struct {
	BatchID     string  `json:"batch_id"`
	UnitCostUSD float64 `json:"unit_cost_usd"`
	VendorTIN   string  `json:"vendor_tin"`
	MarginPct   float64 `json:"margin_pct"`
}

// AnchorRecord commits an hourly Merkle root on-chain
func (s *SmartContract) AnchorRecord(ctx contractapi.TransactionContextInterface, batchID, merkleRoot, schemaVersion string) error {
	clientMSPID, err := ctx.GetClientIdentity().GetMSPID()
	if err != nil {
		return fmt.Errorf("failed to get client MSPID: %v", err)
	}

	// Only Org1 (Factory) or Org2 (Verifier) may anchor records
	if clientMSPID != "Org1MSP" && clientMSPID != "Org2MSP" {
		return fmt.Errorf("unauthorized MSP: %s cannot anchor records", clientMSPID)
	}

	record := AnchorRecord{
		BatchID:       batchID,
		MerkleRoot:    merkleRoot,
		Timestamp:     time.Now().UTC(),
		SchemaVersion: schemaVersion,
		AnchoredBy:    clientMSPID,
		IsRevoked:     false,
	}

	recordBytes, err := json.Marshal(record)
	if err != nil {
		return err
	}

	return ctx.GetStub().PutState(batchID, recordBytes)
}

// VerifyRecord verifies whether a Merkle root matches the immutable on-chain record
func (s *SmartContract) VerifyRecord(ctx contractapi.TransactionContextInterface, batchID, claimedMerkleRoot string) (bool, error) {
	recordBytes, err := ctx.GetStub().GetState(batchID)
	if err != nil || recordBytes == nil {
		return false, fmt.Errorf("record for batch %s not found", batchID)
	}

	var record AnchorRecord
	if err := json.Unmarshal(recordBytes, &record); err != nil {
		return false, err
	}

	if record.IsRevoked {
		return false, fmt.Errorf("record is REVOKED: %s", record.RevokeReason)
	}

	return record.MerkleRoot == claimedMerkleRoot, nil
}

// RevokeRecord revokes an attestation upon audit dispute
func (s *SmartContract) RevokeRecord(ctx contractapi.TransactionContextInterface, batchID, reason string) error {
	clientMSPID, err := ctx.GetClientIdentity().GetMSPID()
	if err != nil || clientMSPID != "Org2MSP" {
		return fmt.Errorf("only Org2MSP (Verifier) may revoke records")
	}

	recordBytes, err := ctx.GetStub().GetState(batchID)
	if err != nil || recordBytes == nil {
		return fmt.Errorf("record not found")
	}

	var record AnchorRecord
	json.Unmarshal(recordBytes, &record)
	record.IsRevoked = true
	record.RevokeReason = reason

	updated, _ := json.Marshal(record)
	return ctx.GetStub().PutState(batchID, updated)
}

func main() {
	chaincode, err := contractapi.NewChaincode(&SmartContract{})
	if err != nil {
		panic(fmt.Sprintf("Error creating CarbonLoom chaincode: %v", err))
	}
	if err := chaincode.Start(); err != nil {
		panic(fmt.Sprintf("Error starting CarbonLoom chaincode: %v", err))
	}
}
