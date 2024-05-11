package cmd

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"

	model "github.com/Dev4w4n/e-masjid.my/saas/cli/model"
	"github.com/spf13/cobra"
)

// addCmd represents the add command
var addCmd = &cobra.Command{
	Use:   "add",
	Short: "Adds new tenant to E-Masjid.My Saas",
	Run: func(cmd *cobra.Command, args []string) {
		name, _ := cmd.Flags().GetString("name")
		namespace, _ := cmd.Flags().GetString("namespace")
		keycloakClientId, _ := cmd.Flags().GetString("keycloak-client-id")
		keycloakJwksUrl, _ := cmd.Flags().GetString("keycloak-jwks-url")
		keycloakServer, _ := cmd.Flags().GetString("keycloak-server")
		managerRole, _ := cmd.Flags().GetString("manager-role")
		userRole, _ := cmd.Flags().GetString("user-role")

		request := model.Tenant{
			KeycloakClientId: keycloakClientId,
			KeycloakServer:   keycloakServer,
			KeycloakJwksUrl:  keycloakJwksUrl,
			ManagerRole:      managerRole,
			UserRole:         userRole,
			Name:             name,
			Namespace:        namespace,
			SeparateDb:       true,
		}

		createNewTenant(request)
	},
}

func createNewTenant(request model.Tenant) {
	url := "http://localhost:8090/tenant"

	jsonData, err := json.Marshal(request)
	if err != nil {
		panic(err)
	}

	resp, err := http.Post(url, "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		panic(err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		fmt.Println("Error creating new tenant")
	} else {
		fmt.Println("Tenant created successfully")
	}
}

func init() {
	rootCmd.AddCommand(addCmd)
	addCmd.Flags().StringP("keycloak-client-id", "1", "", "Define the new tenant keycloak client id")
	addCmd.MarkFlagRequired("keycloak-client-id")
	addCmd.Flags().StringP("keycloak-jwks-url", "2", "", "Define the new tenant keycloak jwks url")
	addCmd.MarkFlagRequired("keycloak-jwks-url")
	addCmd.Flags().StringP("keycloak-server", "3", "", "Define the new tenant keycloak server")
	addCmd.MarkFlagRequired("keycloak-server")
	addCmd.Flags().StringP("manager-role", "4", "", "Define the new tenant manager role")
	addCmd.MarkFlagRequired("manager-role")
	addCmd.Flags().StringP("name", "5", "", "Define the new tenant name (must be unique)")
	addCmd.MarkFlagRequired("name")
	addCmd.Flags().StringP("namespace", "6", "", "Define the new tenant namespace")
	addCmd.MarkFlagRequired("namespace")
	addCmd.Flags().StringP("user-role", "7", "", "Define the new tenant user role")
	addCmd.MarkFlagRequired("user-role")
}
