document.addEventListener('keypress', function(e) {
	if( e.key.toLowerCase() == 'r' || e.key.toLowerCase() == 'к' ) location.reload();
});

function getRandom(min, max) { return Math.round(min + Math.random() * (max - min)); }

function drawLine(x1, y1, x2, y2) {
	ctx.beginPath();
	ctx.strokeStyle = 'gray';
	ctx.lineJoin = 'miter';
	ctx.lineWidth = 1;
	ctx.moveTo(x1, y1);
	ctx.lineTo(x2, y2);
	ctx.stroke();
}

function getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) color += letters[Math.round(Math.random() * 15)];
    return color;
}

function getRandomDir() {
	let d;
	switch(getRandom(1, 4)) {
		case 1: d = 'UP';
			break;
		case 2: d = 'DOWN';
			break;
		case 3: d = 'LEFT';
			break;
		case 4: d = 'RIGHT';
			break;
		default:
			alert('ERROR3');
	}
	return d;
}

var apple = {
	x: [],
	y: [],

	Random(number) {
		let tmpX = this.x[number];
		let tmpY = this.y[number];
		this.x[number] = getRandom(0, w / pixel - 1);
		this.y[number] = getRandom(0, h / pixel - 1);

		if((this.x.indexOf(this.x[number]) != -1) && (this.y.indexOf(this.y[number] != -1)) &&
		   (this.x[number] != tmpX) && (this.y[number] != tmpY))
				this.Random(number);

		for( let i = 0; i < snakes.length; i++ ) {
			for( let j = 0; j < snakes[i].x.length; j++ ) {
				if((snakes[i].x[j] == this.x[number]) && (snakes[i].y[j] == this.y[number]))
					this.Random(number);
			}
		}
	}
}

var
canvas = document.getElementById('canv'),
ctx = canvas.getContext('2d');

const number_of_apples = 300;
const maxTurnsWithOutEat = 80;
const numberOfsnakes = 20;
const pixel = 20;
canvas.width = window.innerWidth - window.innerWidth % pixel - pixel;
canvas.height = window.innerHeight - window.innerHeight % pixel - pixel;
const w = canvas.width;
const h = canvas.height;

var snakes = [];

for( let i = 0; i < numberOfsnakes; i++ ) {
	snakes[i] = {
		x: [],
		y: [],
		dir: [],
		tmpDir: [],
		score: 0,
		starve: 0,
		color: 'red',
		Inputs: [],
		Weights: [],

		init() {
			this.x = [];
			this.y = [];
			this.dir = [];
			this.tmpDir = [];
			this.score = 0;
			this.starve = 0;
			this.color = getRandomColor();
			this.Inputs = [];
			this.Weights = [];
			this.x[0] = getRandom(0, w / pixel - 1);
			this.y[0] = getRandom(0, h / pixel - 1);

			for( let i = 0; i < snakes.length; i++ ) {
				for( let j = 1; j < snakes[i].x.length; j++ ) {
					if((snakes[i].x[j] == this.x[0]) && (snakes[i].y[j] == this.y[0]) &&
					   (i != snakes.indexOf(this)) && (j != 0)) 
						this.init();
				}
			}

			this.dir[0] = getRandomDir();
			this.initWeights();
			this.toNormalWeights();
			this.initInputs();
			this.toZeroInputs();
		},

		MoveTail() {
			for( let i = 0; i < this.dir.length; i++ ) {
				switch(this.dir[i]) {
					case 'UP':
						this.y[i]--;
						break;
					case 'DOWN':
						this.y[i]++;
						break;
					case 'LEFT':
						this.x[i]--;
						break;
					case 'RIGHT':
						this.x[i]++;
						break;
					default:
						alert('ERROR1');
				}
				this.tmpDir[i] = this.dir[i];
				if(i - 1 >= 0) { this.dir[i] = this.tmpDir[i-1]; }
			}
		},

		CheckApple() {
			for( let i = 0; i < number_of_apples; i++ ) {
				if (this.x[0] == apple.x[i] && this.y[0] == apple.y[i]) {
					this.starve = 0;
					this.score++;
					apple.Random(i);
					switch(this.dir[this.dir.length - 1]) {
						case 'UP':
							this.x.push(this.x[this.x.length - 1]);
							this.y.push(this.y[this.y.length - 1] + 1);
							break;
						case 'DOWN':
							this.x.push(this.x[this.x.length - 1]);
							this.y.push(this.y[this.y.length - 1] - 1);
							break;
						case 'LEFT':
							this.x.push(this.x[this.x.length - 1] + 1);
							this.y.push(this.y[this.y.length - 1]);
							break;
						case 'RIGHT':
							this.x.push(this.x[this.x.length - 1] - 1);
							this.y.push(this.y[this.y.length - 1]);
							break;
						default:
							alert('ERROR2');
					}
					this.dir.push(this.dir[this.dir.length - 1]);
				}
			}
		},

		CheckGameOver() {
			for( let i = 0; i < snakes.length; i++ ) {
				for( let j = 1; j < snakes[i].x.length; j++ ) {
					if(this.x[0] == snakes[i].x[j] && this.y[0] == snakes[i].y[j]) this.init();
				}
			}
			if ((this.x[0] >= w / pixel) || (this.x[0] < 0) || (this.y[0] >= h / pixel) || (this.y[0] < 0)) this.init();
			if (this.starve >= maxTurnsWithOutEat) this.init();
		},

		initWeights() {
			this.Weights.length = 21;
			for( let i = 0; i < this.Weights.length; i++ ) {
				this.Weights[i] = [];
				this.Weights[i].length = 21;
			}
		},

		toNormalWeights() {
			for( let i = 0; i < this.Weights.length; i++ ) {
				for( let j = 0; j < this.Weights[i].length; j++ ) {
					this.Weights[i][j] = (20 - Math.abs(i - 10) - Math.abs(j - 10)) / 20;
					if((i == 8 && j == 8) || (i == 8 && j == 10) || (i == 10 && j == 8) || (i == 10 && j == 10))
						this.Weights[i][j] = 10000;
				}
			}
		},

		initInputs() {
			this.Inputs.length = 21;
			for( let i = 0; i < this.Inputs.length; i++ ) {
				this.Inputs[i] = [];
				this.Inputs[i].length = 21;
			}
		},

		toZeroInputs() {
			for( let i = 0; i < this.Inputs.length; i++ ) {
				for( let j = 0; j < this.Inputs[i].length; j++ ) {
					this.Inputs[i][j] = 0;
				}
			}
		},

		fillInputs() {
			let
			Input_empty_field = 0,
			Input_our_snake = -100,
			Input_another_snake = -110,
			Input_block = -1,
			Input_apple = 500;

			for( let i = 0; i < this.Inputs.length; i++ ) {
				for( let j = 0; j < this.Inputs[i].length; j++ ) {
					this.Inputs[j][i] = Input_empty_field;
					for( let snakeNum = 0; snakeNum < numberOfsnakes; snakeNum++ ) {
						for( let n = 0; n < snakes[snakeNum].x.length; n++ ) {
							if ((snakes[snakeNum].x[n] == (i + this.x[0] - 10)) && (snakes[snakeNum].y[n] == (j + this.y[0] - 10))
								&& (snakeNum == snakes.indexOf(this)))
									this.Inputs[j][i] = Input_our_snake;
							else if ((snakes[snakeNum].x[n] == (i + this.x[0] - 10)) &&
							         (snakes[snakeNum].y[n] == (j + this.y[0] - 10)))
										this.Inputs[j][i] = Input_another_snake;
						}
					}
					if  (((i + this.x[0] - 10 + 1) > w / pixel) || ((i + this.x[0] - 10) < -1) ||
						((j + this.y[0] - 10 + 1) > h / pixel) || ((j + this.y[0] - 10) < -1))
							this.Inputs[j][i] = Input_block;

					for( let k = 0; k < apple.x.length; k++ ) {
						if ((apple.x[k] == (i + this.x[0] - 10)) && (apple.y[k] == (j + this.y[0] - 10))) {
							this.Inputs[j][i] = Input_apple;
						}
					}
				}
			}

			if (this.Inputs.length == this.Weights.length) {
				for( let i = 0; i < this.Inputs.length; i++ ) {
					for( let j = 0; j < this.Inputs[i].length; j++ ) {
						this.Inputs[i][j] *= this.Weights[i][j];
					}
				}
			}
		},

		output() {
			function switchDir(d) {
				switch(d) {
					case right: return 'RIGHT';
						break;
					case left: return 'LEFT';
						break;
					case up: return 'UP';
						break;
					case down: return 'DOWN';
						break;
					default:
						alert('ERROR4');
				}
			}

			function getOppositeDir(d) {
				switch(d) {
					case 'RIGHT': return 'LEFT';
						break;
					case 'LEFT': return 'RIGHT';
						break;
					case 'UP': return 'DOWN';
						break;
					case 'DOWN': return 'UP';
						break;
					default:
						alert('ERROR5');
				}
			}

			let
			right = 0,
			left = 0,
			up = 0,
			down = 0;

			for( let i = 0; i < this.Inputs.length; i++ ) {
				for( let j = 11; j < this.Inputs[i].length; j++ ) right += this.Inputs[i][j];
			}
			for( let i = 0; i < this.Inputs.length; i++ ) {
				for( let j = 0; j < 10; j++ ) left += this.Inputs[i][j];
			}
			for( let i = 0; i < 10; i++ ) {
				for( let j = 0; j < this.Inputs.length; j++ ) up += this.Inputs[i][j];
			}
			for( let i = 11; i < this.Inputs.length; i++ ) {
				for( let j = 0; j < this.Inputs[i].length; j++ ) down += this.Inputs[i][j];
			}

			if( switchDir(Math.max(right, left, up, down)) == getOppositeDir(this.dir[0]) )
				switch(Math.max(right, left, up, down)) {
					case right: return switchDir(Math.max(left, up, down));
						break;
					case left: return switchDir(Math.max(right, up, down));
						break;
					case up: return switchDir(Math.max(right, left, down));
						break;
					case down: return switchDir(Math.max(right, left, up));
				}
			else return switchDir(Math.max(right, left, up, down));
		}
	}

	snakes[i].init();
}

for( let i = 0; i < number_of_apples; i++ ) apple.Random(i);

for( let i = 0; i < snakes.length; i++ ) snakes[i].init();

function updateScreen() {
	ctx.fillStyle = 'white';
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.strokeStyle = 'gray';
	for( let i = 0; i < w; i += pixel ) drawLine(i, 0, i, h);
	for( let i = 0; i < h; i += pixel ) drawLine(0, i, w, i);
	
	for( let i = 0; i < snakes.length; i++ ) {
		//ctx.fillStyle = getRandomColor(); (cool option)
		ctx.fillStyle = snakes[i].color;
		for( let j = 0; j < snakes[i].x.length; j++ ) {
			ctx.fillRect(snakes[i].x[j]*pixel+1, snakes[i].y[j]*pixel+1, pixel - 2, pixel - 2);
		}
	}

	ctx.fillStyle = 'green';
	for( let i = 0; i < number_of_apples; i++ )
		ctx.fillRect(apple.x[i]*pixel+1, apple.y[i]*pixel+1, pixel - 2, pixel - 2);
	ctx.fillStyle = 'white';
}

function logic() {
	for( let i = 0; i < snakes.length; i++ ) {
		snakes[i].MoveTail();
		snakes[i].CheckGameOver();
		snakes[i].CheckApple();
		snakes[i].toZeroInputs();
		snakes[i].fillInputs();
		snakes[i].dir[0] = snakes[i].output();
		snakes[i].starve++;
	}
}

var timer = setInterval(function() {
	logic();
	updateScreen();
}, 16.6);
