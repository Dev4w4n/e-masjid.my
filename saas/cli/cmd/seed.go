package cmd

import (
	"fmt"
	"net/http"

	"github.com/spf13/cobra"
)

// seedCmd represents the seed command
var seedCmd = &cobra.Command{
	Use:   "seed",
	Short: "Seeds E-Masjid.My Dev data (WARNING!: Experimental Dev only).",
	Run: func(cmd *cobra.Command, args []string) {
		fmt.Println("")
		seedTenants()
	},
}

func init() {
	rootCmd.AddCommand(seedCmd)
}

func seedTenants() {
	// Get data using json
	url := "http://localhost:8080/seed"

	resp, err := http.Post(url, "application/json", nil)

	if err != nil {
		panic(err)
	}

	if resp.StatusCode != 200 {
		fmt.Println("Error seeding tenants")
	} else {
		fmt.Println("Seeded tenants successfully")
	}
}
