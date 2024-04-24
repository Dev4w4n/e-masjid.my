package utils

import (
	"fmt"
	"strings"
)

func ParseDBNameFromPostgresDSN(dsn string) (string, error) {
	// Split the DSN string into key-value pairs
	keyValuePairs := strings.Split(dsn, " ")

	// Loop through the key-value pairs
	for _, pair := range keyValuePairs {
		// Split each pair into key and value
		kv := strings.Split(pair, "=")
		if len(kv) != 2 {
			return "", fmt.Errorf("invalid key-value pair: %s", pair)
		}

		// Check if the key is "dbname"
		if kv[0] == "dbname" {
			// Return the corresponding value
			return kv[1], nil
		}
	}

	// If "dbname" key is not found, return an error
	return "", fmt.Errorf("dbname key not found in DSN: %s", dsn)
}

func RemoveDBNameFromPostgresDSN(dsn string) (string, error) {
	// Split the DSN string into key-value pairs
	keyValuePairs := strings.Split(dsn, " ")

	// Initialize a slice to store filtered key-value pairs
	filteredPairs := make([]string, 0)

	// Loop through the key-value pairs
	for _, pair := range keyValuePairs {
		// Split each pair into key and value
		kv := strings.Split(pair, "=")
		if len(kv) != 2 {
			return "", fmt.Errorf("invalid key-value pair: %s", pair)
		}

		// Check if the key is not "dbname"
		if kv[0] != "dbname" {
			// Append the pair to the filtered key-value pairs
			filteredPairs = append(filteredPairs, pair)
		}
	}

	// Reconstruct the DSN string without the dbname key
	result := strings.Join(filteredPairs, " ")

	return result, nil
}

func AddSuffixToDBName(dsn string, suffix string) string {
	// Split the DSN string into key-value pairs
	pairs := strings.Split(dsn, " ")

	// Initialize variables to store modified dbname and other parts of the DSN
	var modifiedDBName string
	var otherParts []string

	// Loop through the key-value pairs
	for _, pair := range pairs {
		// Split each pair into key and value
		kv := strings.Split(pair, "=")
		if len(kv) != 2 {
			continue
		}
		key, value := kv[0], kv[1]
		// Check if the key is "dbname"
		if key == "dbname" {
			// Append the modified dbname with suffix
			modifiedDBName = fmt.Sprintf("%s-%s", value, suffix)
		} else {
			// Append other parts of the DSN
			otherParts = append(otherParts, fmt.Sprintf("%s=%s", key, value))
		}
	}

	// Construct the modified DSN with the new dbname
	modifiedDSN := strings.Join(otherParts, " ")
	if modifiedDBName != "" {
		modifiedDSN += fmt.Sprintf(" dbname=%s", modifiedDBName)
	}

	return modifiedDSN
}
