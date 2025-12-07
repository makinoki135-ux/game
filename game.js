// キャンバス要素と描画コンテキストを取得
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// --- 1. ボール設定 ---
let x = canvas.width / 2; // ボールのx座標
let y = canvas.height - 30; // ボールのy座標
let dx = 2; // ボールのx方向の速度
let dy = -2; // ボールのy方向の速度
const ballRadius = 10; // ボールの半径

// --- 2. パドル設定 ---
const paddleHeight = 10;
const paddleWidth = 75;
let paddleX = (canvas.width - paddleWidth) / 2; // パドルのx座標

// パドルの移動操作フラグ
let rightPressed = false;
let leftPressed = false;

// --- 3. ブロック設定 ---
const brickRowCount = 3;
const brickColumnCount = 5;
const brickWidth = 75;
const brickHeight = 20;
const brickPadding = 10; // ブロック間の隙間
const brickOffsetTop = 30; // 上端からのオフセット
const brickOffsetLeft = 30; // 左端からのオフセット
let score = 0; // スコア

// ブロックの状態を保持する2次元配列
const bricks = [];
for (let c = 0; c < brickColumnCount; c++) {
    bricks[c] = [];
    for (let r = 0; r < brickRowCount; r++) {
        // status: 1 はブロックが存在、 0 は破壊済み
        bricks[c][r] = { x: 0, y: 0, status: 1 };
    }
}

// --- 4. イベントリスナー（キーボード操作） ---
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

function keyDownHandler(e) {
    if (e.key === "Right" || e.key === "ArrowRight") {
        rightPressed = true;
    } else if (e.key === "Left" || e.key === "ArrowLeft") {
        leftPressed = true;
    }
}

function keyUpHandler(e) {
    if (e.key === "Right" || e.key === "ArrowRight") {
        rightPressed = false;
    } else if (e.key === "Left" || e.key === "ArrowLeft") {
        leftPressed = false;
    }
}

// --- 5. 衝突判定ロジック ---

// ブロックとの衝突判定
function collisionDetection() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            const b = bricks[c][r];
            // ブロックが存在する場合のみ判定
            if (b.status === 1) {
                if (x > b.x && x < b.x + brickWidth && y > b.y && y < b.y + brickHeight) {
                    // 衝突したらボールのy方向の速度を反転
                    dy = -dy;
                    // ブロックを破壊済みにする
                    b.status = 0;
                    score++;
                    
                    // すべてのブロックを破壊したらゲームクリア
                    if (score === brickRowCount * brickColumnCount) {
                        alert("ゲームクリア！おめでとう！");
                        document.location.reload(); // ページをリロードして最初から始める
                    }
                }
            }
        }
    }
}

// --- 6. 描画関数 ---

// ボールの描画
function drawBall() {
    ctx.beginPath();
    ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = "#0095DD";
    ctx.fill();
    ctx.closePath();
}

// パドルの描画
function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
    ctx.fillStyle = "#0095DD";
    ctx.fill();
    ctx.closePath();
}

// ブロックの描画
function drawBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            if (bricks[c][r].status === 1) {
                // ブロックの座標を計算
                const brickX = (c * (brickWidth + brickPadding)) + brickOffsetLeft;
                const brickY = (r * (brickHeight + brickPadding)) + brickOffsetTop;
                
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;
                
                ctx.beginPath();
                ctx.rect(brickX, brickY, brickWidth, brickHeight);
                ctx.fillStyle = "#FF5733"; // ブロックの色
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}

// スコアの描画
function drawScore() {
    ctx.font = "16px Arial";
    ctx.fillStyle = "#0095DD";
    ctx.fillText("スコア: " + score, 8, 20); // 左上 (8, 20) の位置に表示
}

// メインの描画・更新関数（ゲームループ）
function draw() {
    // 毎フレーム、キャンバス全体をクリア
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // オブジェクトの描画
    drawBricks();
    drawBall();
    drawPaddle();
    drawScore();
    
    // 衝突判定
    collisionDetection();

    // --- ボール位置の更新 ---
    x += dx;
    y += dy;

    // 壁との衝突判定（左右の壁）
    if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
        dx = -dx; // x方向の速度を反転
    }
    
    // 壁との衝突判定（上部の壁）
    if (y + dy < ballRadius) {
        dy = -dy; // y方向の速度を反転
    } 
    // 下端に到達した場合
    else if (y + dy > canvas.height - ballRadius) {
        // パドルとの衝突判定
        if (x > paddleX && x < paddleX + paddleWidth) {
            dy = -dy; // パドルに当たったら跳ね返す
        } else {
            // パドルで受け止められなかった場合（ゲームオーバー）
            alert("ゲームオーバー！");
            document.location.reload(); // ページをリロードして最初から始める
        }
    }

    // --- パドル位置の更新（キー入力に応じて） ---
    if (rightPressed && paddleX < canvas.width - paddleWidth) {
        paddleX += 7;
    } else if (leftPressed && paddleX > 0) {
        paddleX -= 7;
    }
    
    // 次の描画のためにこの関数を呼び出す（スムーズなアニメーションに最適）
    requestAnimationFrame(draw);
}

// ゲーム開始
draw();