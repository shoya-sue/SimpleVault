export const IDL = {
  version: "0.1.0",
  name: "simple_vault",
  instructions: [
    {
      name: "initialize",
      accounts: [
        {
          name: "vault",
          isMut: true,
          isSigner: false
        },
        {
          name: "vaultTokenAccount",
          isMut: true,
          isSigner: false
        },
        {
          name: "mint",
          isMut: false,
          isSigner: false
        },
        {
          name: "owner",
          isMut: true,
          isSigner: true
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false
        },
        {
          name: "rent",
          isMut: false,
          isSigner: false
        }
      ],
      args: []
    },
    {
      name: "deposit",
      accounts: [
        {
          name: "vault",
          isMut: true,
          isSigner: false
        },
        {
          name: "vaultTokenAccount",
          isMut: true,
          isSigner: false
        },
        {
          name: "userTokenAccount",
          isMut: true,
          isSigner: false
        },
        {
          name: "owner",
          isMut: true,
          isSigner: true
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false
        }
      ],
      args: [
        {
          name: "amount",
          type: "u64"
        }
      ]
    },
    {
      name: "withdraw",
      accounts: [
        {
          name: "vault",
          isMut: true,
          isSigner: false
        },
        {
          name: "vaultTokenAccount",
          isMut: true,
          isSigner: false
        },
        {
          name: "userTokenAccount",
          isMut: true,
          isSigner: false
        },
        {
          name: "owner",
          isMut: true,
          isSigner: true
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false
        }
      ],
      args: [
        {
          name: "amount",
          type: "u64"
        }
      ]
    },
    {
      name: "queryBalance",
      accounts: [
        {
          name: "vault",
          isMut: false,
          isSigner: false
        },
        {
          name: "tokenAccount",
          isMut: false,
          isSigner: false
        }
      ],
      args: []
    }
  ],
  accounts: [
    {
      name: "Vault",
      type: {
        kind: "struct",
        fields: [
          {
            name: "owner",
            type: "publicKey"
          },
          {
            name: "tokenAccount",
            type: "publicKey"
          },
          {
            name: "bump",
            type: "u8"
          }
        ]
      }
    }
  ],
  errors: [
    {
      code: 6000,
      name: "Unauthorized",
      msg: "Only the vault owner can perform this action"
    }
  ]
}; 