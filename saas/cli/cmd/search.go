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

	model "github.com/Dev4w4n/e-masjid.my/saas/cli/model"
	"github.com/spf13/cobra"
)

// searchCmd represents the search command
var searchCmd = &cobra.Command{
	Use:   "search",
	Short: "Search for tenant by name",
	Run: func(cmd *cobra.Command, args []string) {
		name, _ := cmd.Flags().GetString("name")

		if err := searchTenant(name); err != nil {
			fmt.Println(err)
		}
	},
}

func init() {
	rootCmd.AddCommand(searchCmd)

	searchCmd.Flags().StringP("name", "n", "", "Define the new tenant name")
	searchCmd.MarkFlagRequired("name")
}

func searchTenant(name string) error {
	// Get data using json
	url := "http://localhost:8090/tenant/" + name

	resp, err := http.Get(url)

	if err != nil {
		panic(err)
	}

	if resp.StatusCode != 200 {
		fmt.Println("Tenant not found")
	} else {
		var tenant model.Tenant

		fmt.Println(resp.Body)

		err := json.NewDecoder(resp.Body).Decode(&tenant)

		if err != nil {
			panic(err)
		}

		fmt.Printf("%+v\n", tenant)
		displaySingleTenant(tenant)
	}

	return nil
}

func displaySingleTenant(tenant model.Tenant) {
	// Displays the single tenant in details
	w := tabwriter.NewWriter(os.Stdout, 20, 10, 2, ' ', tabwriter.TabIndent)

	fmt.Println("")
	fmt.Println("Tenant Detailed Informations")
	fmt.Println("----------------------------")
	fmt.Fprintln(w, "TENANT ID:", "\t", tenant.ID)
	fmt.Fprintln(w, "NAME:", "\t", tenant.Name)
	fmt.Fprintln(w, "NAMESPACE:", "\t", tenant.Namespace)
	fmt.Fprintln(w, "MANAGER ROLE:", "\t", tenant.ManagerRole)
	fmt.Fprintln(w, "USER ROLE:", "\t", tenant.UserRole)
	fmt.Fprintln(w, "KEYCLOAK CLIENT ID:", "\t", tenant.KeycloakClientId)
	fmt.Fprintln(w, "KEYCLOAK SERVER:", "\t", tenant.KeycloakServer)
	fmt.Fprintln(w, "KEYCLOAK JWKS URL:", "\t", tenant.KeycloakJwksUrl)
	w.Flush()
}
