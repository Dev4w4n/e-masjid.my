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

	"github.com/spf13/cobra"
)

type Tenant struct {
	ID               string `gorm:"type:varchar(36)" json:"id"`
	Name             string `gorm:"column:name;index;size:255;"`
	ManagerRole      string `gorm:"column:manager_role"`
	UserRole         string `gorm:"column:user_role"`
	KeycloakClientId string `gorm:"column:keycloak_client_id"`
	KeycloakServer   string `gorm:"column:keycloak_server"`
	KeycloakJwksUrl  string `gorm:"column:keycloak_jwks_url"`
	CreatedAt        int64  `gorm:"column:created_at"`
}

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
	w := tabwriter.NewWriter(os.Stdout, 10, 16, 2, ' ', tabwriter.TabIndent)

	fmt.Fprintln(w, "TENANT ID\t NAME\t KEYCLOAK CLIENT ID\t CREATED DATE")
	// Get data using json
	url := "http://localhost:8090/tenants"

	resp, err := http.Get(url)
	if err != nil {
		panic(err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		fmt.Println("Error listing tenants")
	}

	var tenants []Tenant

	json.NewDecoder(resp.Body).Decode(&tenants)

	for _, tenant := range tenants {
		fmt.Fprintln(w, tenant.ID, "\t", tenant.Name, "\t", tenant.KeycloakClientId, "\t", time.Unix(tenant.CreatedAt, 0))
		// DISPLAY tenants[0].CreatedAt EPOCH TIME AS DATE AND TIME

		// fmt.Println()
	}

	w.Flush()
}
