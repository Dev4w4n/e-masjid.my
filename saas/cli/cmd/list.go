/*
Copyright © 2024 Rohaizan Roosley rohaizanr@gmail.com
*/
package cmd

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"text/tabwriter"
	"time"

	model "github.com/Dev4w4n/e-masjid.my/saas/cli/model"
	"github.com/spf13/cobra"
)

// listCmd represents the list command
var listCmd = &cobra.Command{
	Use:   "list",
	Short: "Lists all tenants in E-Masjid.My Saas.",
	Run: func(cmd *cobra.Command, args []string) {
		fmt.Println("")
		listTenants()
	},
}

func init() {
	rootCmd.AddCommand(listCmd)
}

// get list of tenants from http://localhost:8090/tenant
func listTenants() {
	// Get data using json
	url := "http://localhost:8090/tenants"

	resp, err := http.Get(url)
	if err != nil {
		panic(err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		fmt.Println("Error listing tenants")
	} else {
		w := tabwriter.NewWriter(os.Stdout, 10, 16, 2, ' ', tabwriter.TabIndent)

		fmt.Fprintln(w, "TENANT ID\t NAME\t KEYCLOAK CLIENT ID\t CREATED DATE")
		var tenants []model.Tenant

		json.NewDecoder(resp.Body).Decode(&tenants)

		for _, tenant := range tenants {
			fmt.Fprintln(w, tenant.ID, "\t", tenant.Name, "\t", tenant.KeycloakClientId, "\t", time.Unix(tenant.CreatedAt, 0))
		}

		w.Flush()
	}
}
