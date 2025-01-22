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
        
        // 添加buff系统
        this.buffs = [];
        this.buffTypes = [
            {
                type: 'rapidFire',
                icon: '⚡',
                color: '#ffcc00',
                duration: 5000,
                effect: () => {
                    const oldRate = this.shootCooldown;
                    this.shootCooldown = 100;
                    setTimeout(() => {
                        this.shootCooldown = oldRate;
                    }, 5000);
                }
            },
            {
                type: 'shield',
                icon: '🛡️',
                color: '#00ff00',
                duration: 8000,
                effect: () => {
                    this.isInvincible = true;
                    setTimeout(() => {
                        this.isInvincible = false;
                    }, 8000);
                }
            },
            {
                type: 'multiShot',
                icon: '🎯',
                color: '#ff00ff',
                duration: 6000,
                effect: () => {
                    this.isMultiShot = true;
                    setTimeout(() => {
                        this.isMultiShot = false;
                    }, 6000);
                }
            }
        ];
        
        // 添加射击冷却
        this.shootCooldown = 200;
        this.lastShootTime = 0;
        this.isInvincible = false;
        this.isMultiShot = false;
        
        // 添加移动端支持
        this.touchStartX = 0;
        this.isTouching = false;
        
        this.bindEvents();
        this.updateScore(0);
        this.updateLives(3);
        this.bindTouchEvents();
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
    
    bindTouchEvents() {
        this.canvas.addEventListener('touchstart', (e) => {
            this.touchStartX = e.touches[0].clientX;
            this.isTouching = true;
        });
        
        this.canvas.addEventListener('touchmove', (e) => {
            if (this.isTouching) {
                const touchX = e.touches[0].clientX;
                const diff = touchX - this.touchStartX;
                this.player.x += diff * 0.5;
                this.touchStartX = touchX;
                
                // 确保玩家不会移出屏幕
                this.player.x = Math.max(0, Math.min(this.canvas.width - this.player.width, this.player.x));
            }
        });
        
        this.canvas.addEventListener('touchend', () => {
            this.isTouching = false;
        });
    }
    
    spawnBuff() {
        if (Math.random() < 0.01) { // 1%的概率生成buff
            const buffType = this.buffTypes[Math.floor(Math.random() * this.buffTypes.length)];
            const buff = {
                x: Math.random() * (this.canvas.width - 20),
                y: -20,
                width: 20,
                height: 20,
                speed: 2,
                type: buffType
            };
            this.buffs.push(buff);
        }
    }
    
    shoot() {
        const currentTime = Date.now();
        if (this.keys.space && currentTime - this.lastShootTime >= this.shootCooldown) {
            if (this.isMultiShot) {
                // 三发子弹
                for (let i = -1; i <= 1; i++) {
                    const bullet = {
                        x: this.player.x + this.player.width / 2 - 2.5 + (i * 10),
                        y: this.player.y,
                        width: 5,
                        height: 10,
                        speed: 7,
                        angle: i * 0.2 // 添加一个小角度
                    };
                    this.bullets.push(bullet);
                }
            } else {
                // 单发子弹
                const bullet = {
                    x: this.player.x + this.player.width / 2 - 2.5,
                    y: this.player.y,
                    width: 5,
                    height: 10,
                    speed: 7,
                    angle: 0
                };
                this.bullets.push(bullet);
            }
            this.lastShootTime = currentTime;
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
            bullet.x += Math.sin(bullet.angle) * bullet.speed;
            bullet.y -= Math.cos(bullet.angle) * bullet.speed;
            return bullet.y > 0 && bullet.x > 0 && bullet.x < this.canvas.width;
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
        
        // 更新buff
        this.buffs = this.buffs.filter(buff => {
            buff.y += buff.speed;
            
            // 检查与玩家碰撞
            if (this.checkCollision(buff, this.player)) {
                buff.type.effect();
                return false;
            }
            
            return buff.y < this.canvas.height;
        });
        
        // 生成新敌人
        this.frameCount++;
        if (this.frameCount % this.enemySpawnRate === 0) {
            this.spawnEnemy();
        }
        
        // 生成buff
        this.spawnBuff();
        
        // 自动射击（移动端）
        if (this.isTouching) {
            this.keys.space = true;
            this.shoot();
            this.keys.space = false;
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
        
        // 绘制buff
        this.buffs.forEach(buff => {
            this.ctx.fillStyle = buff.type.color;
            this.ctx.font = '20px Arial';
            this.ctx.fillText(buff.type.icon, buff.x, buff.y);
        });
        
        // 绘制护盾效果
        if (this.isInvincible) {
            this.ctx.strokeStyle = '#00ff00';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.arc(
                this.player.x + this.player.width / 2,
                this.player.y + this.player.height / 2,
                this.player.width * 0.8,
                0,
                Math.PI * 2
            );
            this.ctx.stroke();
        }
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