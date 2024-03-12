package utils

import (
	"encoding/csv"
	"encoding/json"
	"strings"

	"github.com/Dev4w4n/e-masjid.my/api/khairat-api/model"
)

func ConvertCsvToMembers(jsonData string) ([]model.Member, error) {
	// Parse JSON into a struct
	var data map[string]string
	if err := json.Unmarshal([]byte(jsonData), &data); err != nil {
		return nil, err
	}

	// Extract CSV data
	csvData := data["csv"]

	// Create a CSV reader
	reader := csv.NewReader(strings.NewReader(csvData))
	reader.Comma = ';'

	// Read all records from CSV
	records, err := reader.ReadAll()
	if err != nil {
		return nil, err
	}

	// Declare a slice to store Member structs
	var members []model.Member

	for _, record := range records[1:] { // Skipping header
		member := model.Member{
			Person: model.Person{
				Name:     record[0],
				IcNumber: record[1],
				Phone:    record[2],
				Address:  "",
			},
		}
		members = append(members, member)
	}

	return members, nil
}
