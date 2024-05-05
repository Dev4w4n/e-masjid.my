/*
Copyright © 2024 Rohaizan Roosley rohaizanr@gmail.com
*/
package cmd

import (
	"github.com/spf13/cobra"
)

// searchCmd represents the search command
var searchCmd = &cobra.Command{
	Use:   "search",
	Short: "Search for tenant by namespace",
	Run: func(cmd *cobra.Command, args []string) {
		// namespace, _ := cmd.Flags().GetString("namespace")
	},
}

func init() {
	rootCmd.AddCommand(searchCmd)

	searchCmd.Flags().StringP("namespace", "n", "", "Define the new tenant namespace")
	searchCmd.MarkFlagRequired("namespace")
}

// func searchTenant(namespace string) (*pb.Tenant, error) {
// 	// Get gRPC connection
// 	conn, err := grpcutils.NewGrpcConnection()
// 	if err != nil {
// 		log.Fatalf("Error dialing: %v", err)
// 		return nil, err
// 	}
// 	defer grpcutils.CloseGrpcConnection(conn)

// 	client := pb.NewTenantsClient(conn)

// 	ctx, cancel := context.WithTimeout(context.Background(), time.Second)
// 	defer cancel()

// 	request := &pb.TenantNamespaceRequest{NameSpace: namespace}

// 	tenant, err := client.FindByNamespace(ctx, request)

// 	if err != nil {
// 		return nil, err
// 	}

// 	conn.Close()

// 	return tenant, nil
// }

// func displaySingleTenant(tenant *pb.Tenant) {
// 	// Displays the single tenant in details
// 	w := tabwriter.NewWriter(os.Stdout, 20, 10, 2, ' ', tabwriter.TabIndent)

// 	fmt.Println("")
// 	fmt.Println("Tenant Detailed Informations")
// 	fmt.Println("----------------------------")
// 	fmt.Fprintln(w, "TENANT ID:", "\t", tenant.Id)
// 	fmt.Fprintln(w, "NAMESPACE:", "\t", tenant.NameSpace)
// 	fmt.Fprintln(w, "DB NAME:", "\t", tenant.DbName)
// 	fmt.Fprintln(w, "DB USER:", "\t", tenant.DbUser)
// 	fmt.Fprintln(w, "DB PASSWORD:", "\t", tenant.DbUser)
// 	fmt.Fprintln(w, "ALLOWED ORIGIN:", "\t", tenant.AllowedOrigin)
// 	fmt.Fprintln(w, "MANAGER ROLE:", "\t", tenant.ManagerRole)
// 	fmt.Fprintln(w, "USER ROLE:", "\t", tenant.UserRole)
// 	fmt.Fprintln(w, "KEYCLOAK CLIENT ID:", "\t", tenant.KeycloakClientId)
// 	fmt.Fprintln(w, "KEYCLOAK SERVER:", "\t", tenant.KeycloakServer)
// 	fmt.Fprintln(w, "KEYCLOAK JWKS URL:", "\t", tenant.KeycloakJwksUrl)
// 	w.Flush()
// }
