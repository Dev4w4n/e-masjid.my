package error

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/rs/zerolog/log"
)

func WebError(ctx *gin.Context, httpStatusCode int, err error, message string) {
	if err != nil {
		errorMessage := fmt.Sprintf("%s: %v", message, err)
		log.Error().Msg(errorMessage)
		ctx.JSON(httpStatusCode, gin.H{"error": errorMessage})
	}
}

func InternalServerError(ctx *gin.Context, err error, message string) {
	WebError(ctx, http.StatusInternalServerError, err, message)
}

func BadRequestError(ctx *gin.Context, err error, message string) {
	WebError(ctx, http.StatusBadRequest, err, message)
}

func ErrorPanic(err error) {
	if err != nil {
		panic(err)
	}
}