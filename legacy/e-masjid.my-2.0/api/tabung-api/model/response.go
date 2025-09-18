package model

type Response struct {
	Content interface{} `json:"content"`
	Total   int         `json:"total"`
}
