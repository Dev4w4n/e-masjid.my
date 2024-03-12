package model

type Response struct {
	Content interface{} `json:"content"`
	// Empty            bool        `json:"empty"`
	// First            bool        `json:"first"`
	// Last             bool        `json:"last"`
	// Number           int         `json:"number"`
	// NumberOfElements int         `json:"numberOfElements"`
	// Pageable         struct {
	// 	PageNumber int `json:"pageNumber"`
	// 	PageSize   int `json:"pageSize"`
	// 	Sort       struct {
	// 		Empty    bool `json:"empty"`
	// 		Unsorted bool `json:"unsorted"`
	// 		Sorted   bool `json:"sorted"`
	// 	}
	// 	Offset int `json:"offset"`
	// }
	// Size int `json:"size"`
	// Sort struct {
	// 	Empty    bool `json:"empty"`
	// 	Unsorted bool `json:"unsorted"`
	// 	Sorted   bool `json:"sorted"`
	// }
	// TotalElements int `json:"totalElements"`
	// TotalPages    int `json:"totalPages"`
}
