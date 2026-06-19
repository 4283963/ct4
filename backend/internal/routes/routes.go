package routes

import (
	"net/http"
	"strconv"

	"warehouse-twin/internal/hub"
	"warehouse-twin/internal/models"

	"github.com/gin-gonic/gin"
)

type SetTargetRequest struct {
	X float64 `json:"x" binding:"required"`
	Z float64 `json:"z" binding:"required"`
}

func SetupRouter(h *hub.Hub, w *models.Warehouse) *gin.Engine {
	r := gin.Default()

	r.Use(CORS())

	api := r.Group("/api")
	{
		api.GET("/health", func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{"status": "ok"})
		})

		api.GET("/warehouse", func(c *gin.Context) {
			c.JSON(http.StatusOK, w.GetSnapshot())
		})

		api.GET("/agvs", func(c *gin.Context) {
			snap := w.GetSnapshot()
			c.JSON(http.StatusOK, snap.AGVs)
		})

		api.GET("/agvs/:id", func(c *gin.Context) {
			id := c.Param("id")
			agv, ok := w.GetAGV(id)
			if !ok {
				c.JSON(http.StatusNotFound, gin.H{"error": "AGV not found"})
				return
			}
			c.JSON(http.StatusOK, agv)
		})

		api.POST("/agvs/:id/target", func(c *gin.Context) {
			id := c.Param("id")
			var req SetTargetRequest
			if err := c.ShouldBindJSON(&req); err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
				return
			}
			if ok := w.SetAGVTarget(id, req.X, req.Z); !ok {
				c.JSON(http.StatusNotFound, gin.H{"error": "AGV not found"})
				return
			}
			c.JSON(http.StatusOK, gin.H{"message": "target set"})
		})

		api.GET("/racks", func(c *gin.Context) {
			snap := w.GetSnapshot()
			c.JSON(http.StatusOK, snap.Racks)
		})

		api.GET("/stats", func(c *gin.Context) {
			snap := w.GetSnapshot()
			totalSlots := 0
			occupiedSlots := 0
			for _, rack := range snap.Racks {
				for _, slot := range rack.Slots {
					totalSlots++
					if slot.Status == models.SlotOccupied {
						occupiedSlots++
					}
				}
			}
			c.JSON(http.StatusOK, gin.H{
				"agvCount":      len(snap.AGVs),
				"rackCount":     len(snap.Racks),
				"totalSlots":    totalSlots,
				"occupiedSlots": occupiedSlots,
				"emptySlots":    totalSlots - occupiedSlots,
				"timestamp":     snap.Time,
			})
		})
	}

	r.GET("/ws", func(c *gin.Context) {
		h.ServeWS(c.Writer, c.Request)
	})

	return r
}

func CORS() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}

		c.Next()
	}
}

func parseFloat(s string, def float64) float64 {
	v, err := strconv.ParseFloat(s, 64)
	if err != nil {
		return def
	}
	return v
}
