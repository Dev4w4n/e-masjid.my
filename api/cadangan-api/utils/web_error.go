package utils

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/rs/zerolog/log"
)

func WebError(ctx *gin.Context, err error, message string) {
	if err != nil {
		errorMessage := fmt.Sprintf("%s: %v", message, err)
		log.Error().Msg(errorMessage)
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": errorMessage})
	}
}
