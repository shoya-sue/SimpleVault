export const IDL = {
  "version": "0.1.0",
  "name": "simple_vault",
  "instructions": [
    {
      "name": "initialize",
      "accounts": [
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vaultTokenAccount",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "deposit",
      "accounts": [
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vaultTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "withdraw",
      "accounts": [
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vaultTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "queryBalance",
      "accounts": [
        {
          "name": "vault",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenAccount",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [],
      "returns": "u64"
    },
    {
      "name": "setTimelock",
      "accounts": [
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "lockDuration",
          "type": "u64"
        }
      ]
    },
    {
      "name": "addDelegate",
      "accounts": [
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "delegate",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "removeDelegate",
      "accounts": [
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "delegate",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "setMultisig",
      "accounts": [
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "threshold",
          "type": "u8"
        },
        {
          "name": "signers",
          "type": {
            "vec": "publicKey"
          }
        }
      ]
    },
    {
      "name": "approveTransaction",
      "accounts": [
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vaultTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "destinationTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "transactionId",
          "type": "u64"
        }
      ]
    },
    {
      "name": "initiateWithdrawal",
      "accounts": [
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userTokenAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "setWithdrawalLimit",
      "accounts": [
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "initiateOwnershipTransfer",
      "accounts": [
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "newOwner",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "acceptOwnership",
      "accounts": [
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "newOwner",
          "isMut": true,
          "isSigner": true
        }
      ],
      "args": []
    },
    {
      "name": "cancelOwnershipTransfer",
      "accounts": [
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "Vault",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "tokenAccount",
            "type": "publicKey"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "lockUntil",
            "type": "u64"
          },
          {
            "name": "delegates",
            "type": {
              "vec": "publicKey"
            }
          },
          {
            "name": "multisigThreshold",
            "type": "u8"
          },
          {
            "name": "multisigSigners",
            "type": {
              "vec": "publicKey"
            }
          },
          {
            "name": "pendingTransactions",
            "type": {
              "vec": {
                "defined": "PendingTransaction"
              }
            }
          },
          {
            "name": "maxWithdrawalLimit",
            "type": "u64"
          },
          {
            "name": "transferOwnershipTo",
            "type": {
              "option": "publicKey"
            }
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "PendingTransaction",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "id",
            "type": "u64"
          },
          {
            "name": "transactionType",
            "type": {
              "defined": "TransactionType"
            }
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "destination",
            "type": "publicKey"
          },
          {
            "name": "newOwner",
            "type": {
              "option": "publicKey"
            }
          },
          {
            "name": "signers",
            "type": {
              "vec": "publicKey"
            }
          },
          {
            "name": "executed",
            "type": "bool"
          },
          {
            "name": "createdAt",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "TransactionType",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Withdraw"
          },
          {
            "name": "TransferOwnership"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "NotVaultOwner",
      "msg": "You are not the vault owner"
    },
    {
      "code": 6001,
      "name": "VaultLocked",
      "msg": "Vault is locked until the specified time"
    },
    {
      "code": 6002,
      "name": "InsufficientFunds",
      "msg": "Insufficient funds in vault"
    },
    {
      "code": 6003,
      "name": "MaxDelegatesReached",
      "msg": "Maximum number of delegates reached"
    },
    {
      "code": 6004,
      "name": "DelegateNotFound",
      "msg": "Delegate not found"
    },
    {
      "code": 6005,
      "name": "InvalidThreshold",
      "msg": "Invalid threshold value"
    },
    {
      "code": 6006,
      "name": "NotAuthorized",
      "msg": "Not authorized to perform this action"
    },
    {
      "code": 6007,
      "name": "TransactionNotFound",
      "msg": "Transaction not found"
    },
    {
      "code": 6008,
      "name": "AlreadySigned",
      "msg": "Already signed this transaction"
    },
    {
      "code": 6009,
      "name": "WithdrawalLimitExceeded",
      "msg": "Withdrawal amount exceeds limit"
    },
    {
      "code": 6010,
      "name": "NoOwnershipTransferPending",
      "msg": "No ownership transfer pending"
    },
    {
      "code": 6011,
      "name": "NotPendingOwner",
      "msg": "Not the pending owner"
    }
  ],
  "metadata": {
    "address": "HLQtzTsQyzFgueH4dK3kgL3BZyE7Ts6S7VqCEXUDMcCz"
  }
}; 