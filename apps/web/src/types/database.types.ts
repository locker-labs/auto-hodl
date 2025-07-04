export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      accounts: {
        Row: {
          chainId: string | null
          chainMode: string
          circleAddress: string | null
          createdAt: string
          delegation: Json
          deploySalt: string
          id: string
          roundUpMode: string
          roundUpToDollar: number
          savingsAddress: string | null
          signerAddress: string
          tokenSourceAddress: string
          triggerAddress: string
        }
        Insert: {
          chainId?: string | null
          chainMode?: string
          circleAddress?: string | null
          createdAt?: string
          delegation: Json
          deploySalt: string
          id?: string
          roundUpMode?: string
          roundUpToDollar?: number
          savingsAddress?: string | null
          signerAddress: string
          tokenSourceAddress: string
          triggerAddress: string
        }
        Update: {
          chainId?: string | null
          chainMode?: string
          circleAddress?: string | null
          createdAt?: string
          delegation?: Json
          deploySalt?: string
          id?: string
          roundUpMode?: string
          roundUpToDollar?: number
          savingsAddress?: string | null
          signerAddress?: string
          tokenSourceAddress?: string
          triggerAddress?: string
        }
        Relationships: []
      }
      txs: {
        Row: {
          accountId: string | null
          createdAt: string
          id: string
          spendAmount: string
          spendAt: string
          spendChainId: number
          spendFrom: string
          spendTo: string
          spendToken: string
          spendTxHash: string
          yieldDepositAmount: string | null
          yieldDepositAt: string | null
          yieldDepositChainId: number | null
          yieldDepositToken: string | null
          yieldDepositTxHash: string | null
        }
        Insert: {
          accountId?: string | null
          createdAt: string
          id?: string
          spendAmount: string
          spendAt: string
          spendChainId: number
          spendFrom: string
          spendTo: string
          spendToken: string
          spendTxHash: string
          yieldDepositAmount?: string | null
          yieldDepositAt?: string | null
          yieldDepositChainId?: number | null
          yieldDepositToken?: string | null
          yieldDepositTxHash?: string | null
        }
        Update: {
          accountId?: string | null
          createdAt?: string
          id?: string
          spendAmount?: string
          spendAt?: string
          spendChainId?: number
          spendFrom?: string
          spendTo?: string
          spendToken?: string
          spendTxHash?: string
          yieldDepositAmount?: string | null
          yieldDepositAt?: string | null
          yieldDepositChainId?: number | null
          yieldDepositToken?: string | null
          yieldDepositTxHash?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "txs_accountId_fkey"
            columns: ["accountId"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      accounts_view: {
        Row: {
          chainId: string | null
          chainMode: string | null
          createdAt: string | null
          deploySalt: string | null
          signerAddress: string | null
          tokenSourceAddress: string | null
          triggerAddress: string | null
        }
        Insert: {
          chainId?: string | null
          chainMode?: string | null
          createdAt?: string | null
          deploySalt?: string | null
          signerAddress?: string | null
          tokenSourceAddress?: string | null
          triggerAddress?: string | null
        }
        Update: {
          chainId?: string | null
          chainMode?: string | null
          createdAt?: string | null
          deploySalt?: string | null
          signerAddress?: string | null
          tokenSourceAddress?: string | null
          triggerAddress?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
