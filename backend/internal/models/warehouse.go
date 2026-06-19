package models

import (
	"math"
	"math/rand"
	"sync"
	"time"
)

type AGVStatus string

const (
	AGVIdle      AGVStatus = "idle"
	AGVMoving    AGVStatus = "moving"
	AGVLoading   AGVStatus = "loading"
	AGVUnloading AGVStatus = "unloading"
	AGVCharging  AGVStatus = "charging"
)

type AGV struct {
	ID      string    `json:"id"`
	X       float64   `json:"x"`
	Y       float64   `json:"y"`
	Z       float64   `json:"z"`
	TargetX float64   `json:"targetX"`
	TargetY float64   `json:"targetY"`
	TargetZ float64   `json:"targetZ"`
	Battery float64   `json:"battery"`
	Status  AGVStatus `json:"status"`
	Payload string    `json:"payload"`
	Speed   float64   `json:"speed"`
}

type SlotStatus string

const (
	SlotEmpty    SlotStatus = "empty"
	SlotOccupied SlotStatus = "occupied"
	SlotReserved SlotStatus = "reserved"
)

type Slot struct {
	ID       string     `json:"id"`
	RackID   string     `json:"rackId"`
	Row      int        `json:"row"`
	Col      int        `json:"col"`
	Level    int        `json:"level"`
	X        float64    `json:"x"`
	Y        float64    `json:"y"`
	Z        float64    `json:"z"`
	Status   SlotStatus `json:"status"`
	ItemID   string     `json:"itemId"`
	ItemName string     `json:"itemName"`
}

type Rack struct {
	ID     string  `json:"id"`
	X      float64 `json:"x"`
	Y      float64 `json:"y"`
	Z      float64 `json:"z"`
	Width  float64 `json:"width"`
	Height float64 `json:"height"`
	Depth  float64 `json:"depth"`
	Slots  []*Slot `json:"slots"`
}

type WarehouseSnapshot struct {
	AGVs  []*AGV  `json:"agvs"`
	Racks []*Rack `json:"racks"`
	Time  int64   `json:"time"`
}

type Warehouse struct {
	mu     sync.RWMutex
	agvs   map[string]*AGV
	racks  map[string]*Rack
	slots  map[string]*Slot
	update chan struct{}
}

func NewWarehouse() *Warehouse {
	w := &Warehouse{
		agvs:   make(map[string]*AGV),
		racks:  make(map[string]*Rack),
		slots:  make(map[string]*Slot),
		update: make(chan struct{}, 1),
	}
	w.initRacks()
	w.initAGVs()
	return w
}

func (w *Warehouse) initRacks() {
	rackConfigs := []struct {
		id string
		x  float64
		z  float64
	}{
		{"rack-1", -8, -6},
		{"rack-2", -4, -6},
		{"rack-3", 0, -6},
		{"rack-4", 4, -6},
		{"rack-5", 8, -6},
		{"rack-6", -8, 6},
		{"rack-7", -4, 6},
		{"rack-8", 0, 6},
		{"rack-9", 4, 6},
		{"rack-10", 8, 6},
	}

	for _, rc := range rackConfigs {
		rack := &Rack{
			ID:     rc.id,
			X:      rc.x,
			Y:      0,
			Z:      rc.z,
			Width:  3,
			Height: 4,
			Depth:  1,
		}

		for level := 0; level < 3; level++ {
			for row := 0; row < 2; row++ {
				for col := 0; col < 3; col++ {
					slotID := rc.id + "-l" + string(rune('0'+level)) + "r" + string(rune('0'+row)) + "c" + string(rune('0'+col))
					status := SlotEmpty
					if rand.Float64() > 0.4 {
						status = SlotOccupied
					}
					slot := &Slot{
						ID:       slotID,
						RackID:   rc.id,
						Row:      row,
						Col:      col,
						Level:    level,
						X:        rc.x - 1.2 + float64(col)*1.2,
						Y:        0.5 + float64(level)*1.3,
						Z:        rc.z - 0.3 + float64(row)*0.6,
						Status:   status,
						ItemID:   "",
						ItemName: "",
					}
					if status == SlotOccupied {
						slot.ItemID = "item-" + slotID
						slot.ItemName = randomItemName()
					}
					rack.Slots = append(rack.Slots, slot)
					w.slots[slotID] = slot
				}
			}
		}
		w.racks[rc.id] = rack
	}
}

func (w *Warehouse) initAGVs() {
	agvCount := 5
	for i := 0; i < agvCount; i++ {
		id := "agv-" + string(rune('1'+i))
		agv := &AGV{
			ID:      id,
			X:       -10 + float64(i)*4,
			Y:       0.2,
			Z:       0,
			Battery: 60 + rand.Float64()*40,
			Status:  AGVIdle,
			Speed:   0.08,
		}
		w.agvs[id] = agv
	}
}

func randomItemName() string {
	items := []string{"电子元件A", "电路板B", "传感器C", "电机D", "控制器E", "电池组F", "连接器G", "外壳H"}
	return items[rand.Intn(len(items))]
}

func (w *Warehouse) GetSnapshot() *WarehouseSnapshot {
	w.mu.RLock()
	defer w.mu.RUnlock()

	agvs := make([]*AGV, 0, len(w.agvs))
	for _, agv := range w.agvs {
		agvs = append(agvs, agv)
	}

	racks := make([]*Rack, 0, len(w.racks))
	for _, rack := range w.racks {
		racks = append(racks, rack)
	}

	return &WarehouseSnapshot{
		AGVs:  agvs,
		Racks: racks,
		Time:  time.Now().UnixNano(),
	}
}

func (w *Warehouse) Simulate() {
	ticker := time.NewTicker(50 * time.Millisecond)
	defer ticker.Stop()

	for range ticker.C {
		w.mu.Lock()
		for _, agv := range w.agvs {
			w.updateAGV(agv)
		}
		w.mu.Unlock()

		select {
		case w.update <- struct{}{}:
		default:
		}
	}
}

func (w *Warehouse) updateAGV(agv *AGV) {
	agv.Battery = math.Max(10, agv.Battery-0.005)

	if agv.Status == AGVCharging {
		agv.Battery = math.Min(100, agv.Battery+0.1)
		if agv.Battery >= 95 {
			agv.Status = AGVIdle
		}
		return
	}

	if agv.Battery < 15 && agv.Status != AGVCharging {
		agv.Status = AGVCharging
		agv.TargetX = -10
		agv.TargetZ = 0
		return
	}

	dx := agv.TargetX - agv.X
	dz := agv.TargetZ - agv.Z
	dist := math.Sqrt(dx*dx + dz*dz)

	if dist > 0.05 {
		agv.Status = AGVMoving
		moveX := (dx / dist) * agv.Speed
		moveZ := (dz / dist) * agv.Speed
		if math.Abs(moveX) > math.Abs(dx) {
			moveX = dx
		}
		if math.Abs(moveZ) > math.Abs(dz) {
			moveZ = dz
		}
		agv.X += moveX
		agv.Z += moveZ
	} else {
		if agv.Status == AGVMoving {
			agv.Status = AGVIdle
		}
		if rand.Float64() < 0.01 && agv.Status == AGVIdle {
			agv.TargetX = (rand.Float64() - 0.5) * 20
			agv.TargetZ = (rand.Float64() - 0.5) * 14
		}
	}
}

func (w *Warehouse) Updates() <-chan struct{} {
	return w.update
}

func (w *Warehouse) GetAGV(id string) (*AGV, bool) {
	w.mu.RLock()
	defer w.mu.RUnlock()
	agv, ok := w.agvs[id]
	return agv, ok
}

func (w *Warehouse) SetAGVTarget(id string, x, z float64) bool {
	w.mu.Lock()
	defer w.mu.Unlock()
	agv, ok := w.agvs[id]
	if !ok {
		return false
	}
	agv.TargetX = x
	agv.TargetZ = z
	agv.Status = AGVMoving
	return true
}
