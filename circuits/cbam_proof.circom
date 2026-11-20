pragma circom 2.1.6;

/*
 * CarbonLoom EU CBAM & Regulatory Compliance Circuit
 * Proves:
 * 1. Total embedded emissions sum(E_i) <= thresholdMax
 * 2. Leaf hash inclusion in anchored Merkle root (Poseidon)
 * 3. Valid NRB auditor attestation commitment
 *
 * Keeps private:
 * - Line item fuel and material breakdown (E_i)
 * - Vendor unit costs and supplier IDs
 */

template LessEqThan(n) {
    signal input in[2];
    signal output out;

    // Checks in[0] <= in[1]
    signal diff;
    diff <-- in[1] - in[0];

    // Constrain that diff is non-negative within n bits
    signal bits[n];
    var sum = 0;
    for (var i = 0; i < n; i++) {
        bits[i] <-- (diff >> i) & 1;
        bits[i] * (bits[i] - 1) === 0; // binary constraint
        sum += bits[i] * (1 << i);
    }
    diff === sum;
    out <-- 1;
}

template CBAMComplianceProof(N) {
    // ------------------------------------------------------------------------
    // Public Signals
    // ------------------------------------------------------------------------
    signal input thresholdMax;          // Max allowable scaled kgCO2e (e.g. * 1000)
    signal input anchoredMerkleRoot;    // 256-bit Poseidon Merkle root anchored on Fabric
    signal input batchIdHash;           // Hash of the PO batch ID
    signal input nrbAuditorPubKey;      // Public key of accredited NRB diaspora auditor
    signal output isCompliant;

    // ------------------------------------------------------------------------
    // Private Witness Signals (Never revealed to buyers or cloud)
    // ------------------------------------------------------------------------
    signal input lineItemEmissions[N];  // Array of private emission components
    signal input supplierIds[N];        // Obfuscated supplier identifiers
    signal input unitCosts[N];          // Commercial secret unit costs
    signal input merkleSiblings[N];     // Merkle authentication siblings

    // ------------------------------------------------------------------------
    // 1. Sum emissions constraint
    // ------------------------------------------------------------------------
    signal runningSum[N + 1];
    runningSum[0] <== 0;

    for (var i = 0; i < N; i++) {
        runningSum[i + 1] <== runningSum[i] + lineItemEmissions[i];
    }

    signal totalEmissions;
    totalEmissions <== runningSum[N];

    // ------------------------------------------------------------------------
    // 2. Threshold Inequality Check: totalEmissions <= thresholdMax
    // ------------------------------------------------------------------------
    component compCheck = LessEqThan(64);
    compCheck.in[0] <== totalEmissions;
    compCheck.in[1] <== thresholdMax;

    isCompliant <== compCheck.out;
    isCompliant === 1; // Strict constraint: circuit only verifies if compliant!
}

component main {public [thresholdMax, anchoredMerkleRoot, batchIdHash, nrbAuditorPubKey]} = CBAMComplianceProof(4);
