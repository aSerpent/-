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
            right: false
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
        
        // 添加自动射击相关属性
        this.autoShootInterval = 200; // 自动射击间隔（毫秒）
        
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
        if (e.key === 'p' || e.key === 'P') this.togglePause();
    }
    
    handleKeyUp(e) {
        if (e.key === 'ArrowLeft') this.keys.left = false;
        if (e.key === 'ArrowRight') this.keys.right = false;
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
            speed: 2 + Math.random() * 3,  // 增加敌机速度变化范围
            rotationAngle: Math.random() * Math.PI * 2  // 添加旋转角度
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
        if (currentTime - this.lastShootTime >= this.autoShootInterval) {
            if (this.isMultiShot) {
                // 三发子弹
                for (let i = -1; i <= 1; i++) {
                    const bullet = {
                        x: this.player.x + this.player.width / 2 - 2.5 + (i * 10),
                        y: this.player.y,
                        width: 5,
                        height: 10,
                        speed: 7,
                        angle: i * 0.2
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
            enemy.rotationAngle += 0.02;  // 添加旋转效果
            
            // 检查碰撞
            for (let i = this.bullets.length - 1; i >= 0; i--) {
                const bullet = this.bullets[i];
                if (this.checkCollision(bullet, enemy)) {
                    // 添加爆炸效果
                    this.createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
                    this.bullets.splice(i, 1);
                    this.updateScore(this.score + 100);
                    return false;
                }
            }
            
            // 检查与玩家碰撞
            if (!this.isInvincible && this.checkCollision(enemy, this.player)) {
                this.createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
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
        
        // 自动射击
        this.shoot();
    }
    
    checkCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制玩家飞机
        this.ctx.fillStyle = '#0071e3';
        this.ctx.beginPath();
        this.ctx.moveTo(this.player.x + this.player.width / 2, this.player.y);
        this.ctx.lineTo(this.player.x + this.player.width, this.player.y + this.player.height);
        this.ctx.lineTo(this.player.x, this.player.y + this.player.height);
        this.ctx.closePath();
        this.ctx.fill();

        // 添加飞机尾焰
        this.ctx.fillStyle = '#ff9500';
        this.ctx.beginPath();
        this.ctx.moveTo(this.player.x + this.player.width * 0.3, this.player.y + this.player.height);
        this.ctx.lineTo(this.player.x + this.player.width * 0.5, this.player.y + this.player.height + 15);
        this.ctx.lineTo(this.player.x + this.player.width * 0.7, this.player.y + this.player.height);
        this.ctx.closePath();
        this.ctx.fill();
        
        // 绘制子弹
        this.ctx.fillStyle = '#fff';
        this.bullets.forEach(bullet => {
            this.ctx.beginPath();
            this.ctx.arc(bullet.x + bullet.width / 2, bullet.y + bullet.height / 2, 3, 0, Math.PI * 2);
            this.ctx.fill();
            
            // 添加子弹光效
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = '#fff';
        });
        this.ctx.shadowBlur = 0;
        
        // 绘制敌人
        this.enemies.forEach(enemy => {
            // 敌机主体
            this.ctx.fillStyle = '#ff3b30';
            this.ctx.beginPath();
            this.ctx.moveTo(enemy.x + enemy.width / 2, enemy.y + enemy.height);
            this.ctx.lineTo(enemy.x + enemy.width, enemy.y);
            this.ctx.lineTo(enemy.x, enemy.y);
            this.ctx.closePath();
            this.ctx.fill();
            
            // 敌机装饰
            this.ctx.fillStyle = '#ff9500';
            this.ctx.fillRect(enemy.x + enemy.width * 0.3, enemy.y, enemy.width * 0.4, enemy.height * 0.3);
        });
        
        // 绘制buff
        this.buffs.forEach(buff => {
            this.ctx.fillStyle = buff.type.color;
            this.ctx.font = '20px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            
            // 添加光晕效果
            this.ctx.shadowBlur = 15;
            this.ctx.shadowColor = buff.type.color;
            this.ctx.fillText(buff.type.icon, buff.x + buff.width / 2, buff.y + buff.height / 2);
            this.ctx.shadowBlur = 0;
        });
        
        // 绘制护盾效果
        if (this.isInvincible) {
            this.ctx.strokeStyle = '#00ff00';
            this.ctx.lineWidth = 2;
            this.ctx.shadowBlur = 15;
            this.ctx.shadowColor = '#00ff00';
            this.ctx.beginPath();
            this.ctx.arc(
                this.player.x + this.player.width / 2,
                this.player.y + this.player.height / 2,
                this.player.width * 0.8,
                0,
                Math.PI * 2
            );
            this.ctx.stroke();
            this.ctx.shadowBlur = 0;
        }
    }
    
    gameLoop() {
        if (!this.isGameOver && !this.isPaused) {
            this.update();
            this.draw();
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
    
    // 添加爆炸效果
    createExplosion(x, y) {
        const particles = [];
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * 2,
                vy: Math.sin(angle) * 2,
                life: 1
            });
        }
        
        const animate = () => {
            this.ctx.save();
            particles.forEach((p, index) => {
                p.x += p.vx;
                p.y += p.vy;
                p.life -= 0.02;
                
                if (p.life > 0) {
                    this.ctx.beginPath();
                    this.ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
                    this.ctx.fillStyle = `rgba(255, 59, 48, ${p.life})`;
                    this.ctx.fill();
                    requestAnimationFrame(animate);
                }
            });
            this.ctx.restore();
        };
        
        animate();
    }
}

// 初始化游戏
const game = new Game(); 