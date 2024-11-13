export const ENEMY_HEALTHBAR_WIDTH = 12
export const ENEMY_HEALTHBAR_HEIGHT = 3
export const ENEMY_HEALTHBAR_OFFSET = 3
export const ENEMY_DELAY = 1000
export const ENEMY_HEALTH_LEVEL = 10

export const ENEMY_BASE_COINS = 2
export const INITIAL_COINS_COUNT = 160

export const INITIAL_LIVES_COUNT = 10

export const TILE_SIZE = 16

export interface EnemyData {
  pseudo: string
  count: number
}

export interface Level {
  range: number
  fireRate: number
  price: number
  damage: number
}

export const LEVELS: Level[] = [
  {
    range: 48,
    fireRate: 900,
    price: 60,
    damage: 4,
  },
  {
    range: 60,
    fireRate: 800,
    price: 80,
    damage: 6,
  },
  {
    range: 72,
    fireRate: 700,
    price: 100,
    damage: 8,
  },
]
