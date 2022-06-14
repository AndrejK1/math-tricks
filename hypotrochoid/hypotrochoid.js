let hypotrochoidDrawer = {

    generator: {
        generateValues(R, r, h) {
            let data = [];

            const rotations = r / this.utils.gsd(R, r);

            this.utils.doubleGenerator(0, 360 * rotations, 1)
                .forEach(angle => {
                    let rad = angle * Math.PI / 180;

                    let point = {
                        a: rad,
                        x: this.utils.round(this.utils.calcX(R, r, h, rad)),
                        y: this.utils.round(this.utils.calcY(R, r, h, rad)),
                    }

                    data.push(point);
                })

            return data;
        },

        utils: {
            gsd(x, y) {
                if (y > x) return this.gsd(y, x);
                if (!y) return x;
                return this.gsd(y, x % y);
            },

            calcX(R, r, h, angle) {
                return (R - r) * Math.cos(angle) + h * Math.cos((R - r) / r * angle);
            },

            calcY(R, r, h, angle) {
                return (R - r) * Math.sin(angle) - h * Math.sin((R - r) / r * angle);
            },

            round(value) {
                return Math.round(value * 100) / 100;
            },

            doubleGenerator(minValue, maxValue, step) {
                return {
                    min: minValue,
                    max: maxValue,
                    i: minValue - step,
                    step: step,

                    hasNext() {
                        return this.i < this.max;
                    },

                    next() {
                        this.i += this.step;
                        return this.i;
                    },

                    forEach(func) {
                        while (this.hasNext()) {
                            func(this.next());
                        }
                    }
                }
            }
        },
    },

    printer: {
        drawInterval: null,

        printValues(ctx, cx, cy, values, maxElement) {
            for (let i = 1; i < maxElement; i++) {
                let prev = values[i - 1];
                let curr = values[i];

                this.printLine(ctx, cx + prev.x, cy + prev.y, cx + curr.x, cy + curr.y,
                    '#0000ff', 2);
            }
        },

        printValuesInMotion(values, R, r, h, timeout, iterationSize) {
            const canvas = document.getElementById('canvas');
            const ctx = canvas.getContext('2d');
            const cx = canvas.offsetWidth / 2;
            const cy = canvas.offsetHeight / 2;

            let iteration = 0;

            if (this.drawInterval) {
                clearInterval(this.drawInterval);
            }

            this.drawInterval = setInterval(() => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                if (iteration >= values.length) {
                    clearInterval(this.drawInterval);
                    this.printMotionStep(iteration - 1, ctx, cx, cy, values, R, r, false);
                    return;
                }

                this.printMotionStep(iteration, ctx, cx, cy, values, R, r, true);
                iteration += iterationSize;
            }, timeout);

        },

        printMotionStep(iterationN, ctx, cx, cy, values, R, r, printMeta = false) {
            if (printMeta) {
                this.printCircle(ctx, cx, cy, R, '#000000', false, 2);

                let currentPoint = values[iterationN];

                let smallCircleX = cx + Math.cos(currentPoint.a) * (R - r);
                let smallCircleY = cy + Math.sin(currentPoint.a) * (R - r);

                this.printCircle(ctx, smallCircleX, smallCircleY, 5, '#000000')
                this.printCircle(ctx, cx + currentPoint.x, cy + currentPoint.y, 3, '#000000')
                this.printCircle(ctx, smallCircleX, smallCircleY, r, '#000000', false, 3)

                this.printLine(ctx, smallCircleX, smallCircleY, cx + currentPoint.x, cy + currentPoint.y,
                    '#000000', 3);
            }

            this.printValues(ctx, cx, cy, values, iterationN);
        },

        printCircle(ctx, cx, cy, radius, color, fill = true, lineWidth = 1) {
            ctx.beginPath();
            ctx.arc(cx, cy, radius, 0, 2 * Math.PI);

            ctx.lineWidth = lineWidth;

            if (fill) {
                ctx.fillStyle = color;
                ctx.fill();
            } else {
                ctx.strokeStyle = color;
                ctx.stroke();
            }
        },

        printLine(ctx, x1, y1, x2, y2, color, lineWidth = 1) {
            ctx.beginPath();
            ctx.lineWidth = lineWidth;
            ctx.strokeStyle = color;
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
        }
    },

    test: function (R, r, h, drawPointsByStep = 2) {
        this.printer.printValuesInMotion(this.generator.generateValues(R, r, h), R, r, h, 1000 / 60, drawPointsByStep)
    }
}

// apply configs from ux
function restartSimulation() {
    let R = document.getElementById('R_value').value || 400;
    let r = document.getElementById('r').value || 150;
    let h = document.getElementById('h').value || 100;
    let speed = document.getElementById('speed').value || 2;

    hypotrochoidDrawer.test(+R, +r, +h, +speed)
}

document.getElementById('apply').addEventListener('click', () => restartSimulation());