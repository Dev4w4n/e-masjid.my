package utils

import (
	"encoding/csv"
	"encoding/json"
	"strings"

	"github.com/Dev4w4n/e-masjid.my/api/khairat-api/model"
)

func ConvertCsvToMembers(jsonData string) ([]model.Member, error) {
	// Parse JSON into a struct
	csvMapper := map[string]string{"csv": jsonData}

	// Convert the map to JSON
	jsonBytes, err := json.Marshal(csvMapper)
	if err != nil {
		return nil, err
	}

	var data struct {
		CSV string `json:"csv"`
	}

	if err := json.Unmarshal([]byte(jsonBytes), &data); err != nil {
		return nil, err
	}

	// Create a CSV reader
	reader := csv.NewReader(strings.NewReader(data.CSV))
	reader.Comma = ',' // Assuming comma as delimiter

	// Read all records from CSV
	records, err := reader.ReadAll()
	if err != nil {
		return nil, err
	}

	// Declare a slice to store Member structs
	var members []model.Member

	for _, record := range records { // Including headers
		member := model.Member{
			Person: model.Person{
				Name:     record[0],
				IcNumber: record[1],
				Phone:    record[2],
				Address:  "", // Assuming you don't have the address in your CSV
			},
		}
		members = append(members, member)
	}

	// Remove the first member as it contains header data
	if len(members) > 0 {
		members = members[1:]
	}

	return members, nil
}
