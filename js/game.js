class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 800;
        this.canvas.height = 600;
        
        this.player = {
            x: this.canvas.width / 2,
            y: this.canvas.height - 50,
            width: 50,
            height: 50,
            speed: 5
        };
        
        this.bullets = [];
        this.enemies = [];
        this.score = 0;
        this.lives = 3;
        this.isGameOver = false;
        this.isPaused = false;
        this.enemySpawnRate = 60;
        this.frameCount = 0;
        
        this.keys = {
            left: false,
            right: false,
            space: false
        };
        
        this.bindEvents();
        this.updateScore(0);
        this.updateLives(3);
    }
    
    bindEvents() {
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
        document.getElementById('startGame').addEventListener('click', () => this.start());
        document.getElementById('restartGame').addEventListener('click', () => this.restart());
    }
    
    handleKeyDown(e) {
        if (e.key === 'ArrowLeft') this.keys.left = true;
        if (e.key === 'ArrowRight') this.keys.right = true;
        if (e.key === ' ') this.keys.space = true;
        if (e.key === 'p' || e.key === 'P') this.togglePause();
    }
    
    handleKeyUp(e) {
        if (e.key === 'ArrowLeft') this.keys.left = false;
        if (e.key === 'ArrowRight') this.keys.right = false;
        if (e.key === ' ') this.keys.space = false;
    }
    
    togglePause() {
        this.isPaused = !this.isPaused;
        if (!this.isPaused) this.gameLoop();
    }
    
    updateScore(value) {
        this.score = value;
        document.getElementById('score').textContent = this.score;
    }
    
    updateLives(value) {
        this.lives = value;
        document.getElementById('lives').textContent = this.lives;
    }
    
    spawnEnemy() {
        const enemy = {
            x: Math.random() * (this.canvas.width - 30),
            y: -30,
            width: 30,
            height: 30,
            speed: 2 + Math.random() * 2
        };
        this.enemies.push(enemy);
    }
    
    shoot() {
        if (this.keys.space) {
            const bullet = {
                x: this.player.x + this.player.width / 2 - 2.5,
                y: this.player.y,
                width: 5,
                height: 10,
                speed: 7
            };
            this.bullets.push(bullet);
            this.keys.space = false;
        }
    }
    
    update() {
        // 更新玩家位置
        if (this.keys.left && this.player.x > 0) {
            this.player.x -= this.player.speed;
        }
        if (this.keys.right && this.player.x < this.canvas.width - this.player.width) {
            this.player.x += this.player.speed;
        }
        
        // 更新子弹位置
        this.bullets = this.bullets.filter(bullet => {
            bullet.y -= bullet.speed;
            return bullet.y > 0;
        });
        
        // 更新敌人位置
        this.enemies = this.enemies.filter(enemy => {
            enemy.y += enemy.speed;
            
            // 检查碰撞
            this.bullets.forEach((bullet, bulletIndex) => {
                if (this.checkCollision(bullet, enemy)) {
                    this.bullets.splice(bulletIndex, 1);
                    this.updateScore(this.score + 100);
                    return false;
                }
            });
            
            // 检查与玩家碰撞
            if (this.checkCollision(enemy, this.player)) {
                this.updateLives(this.lives - 1);
                if (this.lives <= 0) {
                    this.gameOver();
                }
                return false;
            }
            
            return enemy.y < this.canvas.height;
        });
        
        // 生成新敌人
        this.frameCount++;
        if (this.frameCount % this.enemySpawnRate === 0) {
            this.spawnEnemy();
        }
    }
    
    checkCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制玩家
        this.ctx.fillStyle = '#0071e3';
        this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
        
        // 绘制子弹
        this.ctx.fillStyle = '#fff';
        this.bullets.forEach(bullet => {
            this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        });
        
        // 绘制敌人
        this.ctx.fillStyle = '#ff3b30';
        this.enemies.forEach(enemy => {
            this.ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
        });
    }
    
    gameLoop() {
        if (!this.isGameOver && !this.isPaused) {
            this.update();
            this.draw();
            this.shoot();
            requestAnimationFrame(() => this.gameLoop());
        }
    }
    
    gameOver() {
        this.isGameOver = true;
        document.getElementById('gameOver').style.display = 'flex';
        document.getElementById('finalScore').textContent = this.score;
    }
    
    restart() {
        this.player.x = this.canvas.width / 2;
        this.bullets = [];
        this.enemies = [];
        this.updateScore(0);
        this.updateLives(3);
        this.isGameOver = false;
        this.isPaused = false;
        document.getElementById('gameOver').style.display = 'none';
        this.gameLoop();
    }
    
    start() {
        this.gameLoop();
    }
}

// 初始化游戏
const game = new Game(); 