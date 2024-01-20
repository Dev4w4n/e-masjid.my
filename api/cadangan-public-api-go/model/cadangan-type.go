package model

type CadanganType struct {
	ID   int    `db:"id" json:"id" validate:"required"`
	Name string `db:"name" json:"name"`
}
