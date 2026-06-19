package main

import (
	"warehouse-twin/internal/hub"
	"warehouse-twin/internal/models"
	"warehouse-twin/internal/routes"
)

func main() {
	warehouse := models.NewWarehouse()
	hub := hub.NewHub(warehouse)
	go hub.Run()
	go warehouse.Simulate()

	r := routes.SetupRouter(hub, warehouse)
	r.Run(":8080")
}
