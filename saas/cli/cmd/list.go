/*
Copyright © 2024 Rohaizan Roosley rohaizanr@gmail.com
*/
package cmd

import (
	"fmt"

	"github.com/spf13/cobra"
)

// listCmd represents the list command
var listCmd = &cobra.Command{
	Use:   "list",
	Short: "Lists all tenants in E-Masjid.My Saas.",
	Run: func(cmd *cobra.Command, args []string) {
		fmt.Println("")

	},
}

func init() {
	rootCmd.AddCommand(listCmd)
}
