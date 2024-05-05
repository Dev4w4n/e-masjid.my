package cmd

import (
	"fmt"

	"github.com/spf13/cobra"
)

// addCmd represents the add command
var addCmd = &cobra.Command{
	Use:   "add",
	Short: "Adds new tenant to E-Masjid.My Saas",
	Run: func(cmd *cobra.Command, args []string) {
		namespace, _ := cmd.Flags().GetString("namespace")

		fmt.Println("add called with namespace:", namespace)
	},
}

func init() {
	rootCmd.AddCommand(addCmd)

	addCmd.Flags().StringP("namespace", "n", "", "Define the new tenant namespace (must be unique)")
	addCmd.MarkFlagRequired("namespace")
}
