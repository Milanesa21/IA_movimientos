// Definir variables globales
let video, canvas, ctx, model;

// Función para inicializar la cámara web
async function setupCamera() {
    video = document.getElementById('video');
    const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: 'user' }
    });
    video.srcObject = stream;

    await new Promise((resolve) => {
        video.onloadedmetadata = () => {
            resolve(video);
        };
    });

    video.play();
}

// Función para cargar el modelo de BlazePose
async function loadModel() {
    console.log('Cargando el modelo de BlazePose...');
    const detectorConfig = {
        runtime: 'tfjs',
        modelType: 'heavy'
    };
    model = await poseDetection.createDetector(poseDetection.SupportedModels.BlazePose, detectorConfig);
    console.log('Modelo de BlazePose cargado exitosamente.');
}


// Función para dibujar las poses detectadas en el lienzo
function drawPoses(poses) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    poses.forEach(pose => {
        drawHumanoid(pose.keypoints);
    });
}

// Función para dibujar un humanoide basado en los puntos clave
function drawHumanoid(keypoints) {
    const adjacentKeyPoints = [
        [0, 1], [1, 2], [2, 3], [3, 7], [0, 4], [4, 5], [5, 6], [6, 8],
        [9, 10], [11, 12], [12, 14], [14, 16], [11, 13], [13, 15], [15, 17],
        [12, 24], [24, 26], [26, 28], [28, 30], [30, 32], [32, 28], [24, 23],
        [23, 25], [25, 27], [27, 29], [29, 31], [31, 27]
    ];

    ctx.fillStyle = 'red';
    ctx.strokeStyle = 'green';
    ctx.lineWidth = 2;

    // Dibujar puntos clave
    keypoints.forEach(keypoint => {
        ctx.beginPath();
        ctx.arc(keypoint.x, keypoint.y, 5, 0, 2 * Math.PI);
        ctx.fill();
    });

    // Dibujar líneas entre puntos adyacentes
    adjacentKeyPoints.forEach(pair => {
        const [startIdx, endIdx] = pair;
        const startKeypoint = keypoints[startIdx];
        const endKeypoint = keypoints[endIdx];

        ctx.beginPath();
        ctx.moveTo(startKeypoint.x, startKeypoint.y);
        ctx.lineTo(endKeypoint.x, endKeypoint.y);
        ctx.stroke();
    });
}

// Función principal
async function main() {
    await setupCamera();
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    await loadModel();
    detectPose();
}

// Función para detectar poses en cada fotograma de video
async function detectPose() {
    const poses = await model.estimatePoses(video);
    drawPoses(poses);
    requestAnimationFrame(detectPose);
}

main(); // Iniciar la aplicación al cargar la página