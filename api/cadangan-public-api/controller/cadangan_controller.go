package controller

import (
	"net/http"

	"github.com/Dev4w4n/e-masjid.my/api/cadangan-public-api/model"
	"github.com/Dev4w4n/e-masjid.my/api/cadangan-public-api/repository"
	errors "github.com/Dev4w4n/e-masjid.my/api/core/error"
	"github.com/gin-gonic/gin"
	"github.com/rs/zerolog/log"
)

type CadanganController struct { 
	cadanganRepository repository.CadanganRepository
}

func NewCadanganController(repo repository.CadanganRepository) *CadanganController {
	return &CadanganController{ 
		cadanganRepository: repo,
	}
 
}

// Save	godoc
//	@Summary		Save cadangan
//	@Description	Save cadangan data in Db.
//	@Param			cadangan	body	model.Cadangan	true	"Save cadangan"
//	@Produce		application/json
//	@Tags			cadangan
//	@Router			/cadangan [post]
func (controller *CadanganController) Save(ctx *gin.Context) {
	log.Info().Msg("save cadangan")

	saveCadangan := model.Cadangan{}
	err := ctx.ShouldBindJSON(&saveCadangan)
	errors.BadRequestError(ctx, err, "failed to bind JSON")

	err = controller.cadanganRepository.Save(saveCadangan)
	errors.InternalServerError(ctx, err, "failed to save cadangan")

	ctx.Header("Content-Type", "application/json")
	ctx.Status(http.StatusOK)
}
