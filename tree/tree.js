let treeDrawer = {
    configuration: {
        global: {
            minBranchesCount: 2,
            maxBranchesCount: 3,
            minBranchLength: 5,
            minBranchWidth: 2,
            leafSizeMin: 3,
            leafSizeMax: 5,
        },
        init: {
            branchLength: 80,
            branchWidth: 15,
            branchAngleMin: 270,
            branchAngleMax: 270,
        },
        child: {
            branchAngleMin: -45,
            branchAngleMax: 45,
            branchLengthMultiplierMin: 0.7,
            branchLengthMultiplierMax: 0.85,
            branchWidthMultiplierMin: 0.8,
            branchWidthMultiplierMax: 0.9,
        },
    },

    Branch: class {
        children;
        isLeaf = false;
        leafSize;
        angle;
        length;
        width;

        constructor(angle, length, width) {
            this.angle = angle;
            this.length = length;
            this.width = Math.max(width, treeDrawer.configuration.global.minBranchWidth);
            this.children = [];

            if (treeDrawer.configuration.global.minBranchLength >= length) {
                this.isLeaf = true;
                this.leafSize = treeDrawer.utils.chooseBetween(treeDrawer.configuration.global.leafSizeMin, treeDrawer.configuration.global.leafSizeMax);
            }
        }
    },

    treeRoot: null,

    init(configuration) {
        this.configuration = configuration;
    },

    generateTree() {
        this.treeRoot = new treeDrawer.Branch(
            this.utils.chooseBetween(this.configuration.init.branchAngleMin, this.configuration.init.branchAngleMax),
            this.configuration.init.branchLength,
            this.configuration.init.branchWidth
        );

        this.fillChildren(this.treeRoot);
    },

    generateChild(parentBranch, childIndex, childCount) {
        if (parentBranch.isLeaf) {
            return null;
        }

        let newBranch = new treeDrawer.Branch(
            this.utils.calculateAngle(parentBranch.angle, childIndex, childCount),
            this.utils.chooseBetween(parentBranch.length * this.configuration.child.branchLengthMultiplierMin, parentBranch.length * this.configuration.child.branchLengthMultiplierMax),
            this.utils.chooseBetween(parentBranch.width * this.configuration.child.branchWidthMultiplierMin, parentBranch.width * this.configuration.child.branchWidthMultiplierMax)
        );

        this.fillChildren(newBranch)

        return newBranch;
    },

    fillChildren(branch) {
        let childCount = Math.round(this.utils.chooseBetween(this.configuration.global.minBranchesCount, this.configuration.global.maxBranchesCount));

        for (let i = 0; i < childCount; i++) {
            branch.children.push(this.generateChild(branch, i, childCount));
        }
    },

    utils: {
        chooseBetween(min, max) {
            return min + Math.random() * (max - min);
        },

        calculateAngle(parentAngle, childIndex, childCount) {
            let angleRangeValue = treeDrawer.configuration.child.branchAngleMax - treeDrawer.configuration.child.branchAngleMin;

            let childAngleMin = parentAngle + treeDrawer.configuration.child.branchAngleMin + angleRangeValue / childCount * childIndex;
            let childAngleMax = parentAngle + treeDrawer.configuration.child.branchAngleMin + angleRangeValue / childCount * (childIndex + 1);

            return this.chooseBetween(childAngleMin, childAngleMax);
        }
    },

    test(configuration) {
        if (configuration) {
            this.init(configuration);
        }

        this.generateTree();
        this.printer.print();
    },

    printer: {
        print() {
            let canvas = document.getElementById("canvas");
            let canvasWidth = canvas.width;
            let canvasHeight = canvas.height;
            let ctx = canvas.getContext("2d");
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            let treeYOffset = canvasHeight - 50;

            this.printRect(ctx, 0, treeYOffset, canvasWidth, canvasHeight, "#C3B091");
            this.printBranch(ctx, canvasWidth / 2, treeYOffset, treeDrawer.treeRoot);
        },

        printBranch(ctx, x, y, branch) {
            if (branch.isLeaf) {
                this.printCircle(ctx, x, y, branch.leafSize, "#00FF00", true);
                return;
            }

            let xEnd = x + branch.length * Math.cos(branch.angle * (Math.PI / 180));
            let yEnd = y + branch.length * Math.sin(branch.angle * (Math.PI / 180));

            this.printLine(ctx, x, y, xEnd, yEnd, "#999900", branch.width)

            for (const child of branch.children) {
                this.printBranch(ctx, xEnd, yEnd, child);
            }
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
        },

        printRect(ctx, x1, y1, x2, y2, color, fill = true, lineWidth = 1) {
            ctx.beginPath();
            ctx.lineWidth = lineWidth;
            ctx.strokeStyle = color;
            ctx.rect(x1, y1, x2, y2);

            if (fill) {
                ctx.fillStyle = color;
                ctx.fill();
            } else {
                ctx.strokeStyle = color;
                ctx.stroke();
            }
        }
    },
}

// apply configs from ux
function restartSimulation() {
    let configuration = {
        global: {
            minBranchesCount: +document.getElementById('Branches').value ?? 2,
            maxBranchesCount: +document.getElementById('BranchesMax').value ?? 3,
            minBranchLength: +document.getElementById('MinBranchL').value ?? 5,
            minBranchWidth: +document.getElementById('MinBranchW').value ?? 2,
            leafSizeMin: +document.getElementById('Leaf').value ?? 3,
            leafSizeMax: +document.getElementById('LeafMax').value ?? 5,
        },
        init: {
            branchLength: +document.getElementById('InitLength').value ?? 80,
            branchWidth: +document.getElementById('InitWidth').value ?? 15,
            branchAngleMin: +document.getElementById('InitAngle').value ?? 270,
            branchAngleMax: +document.getElementById('InitAngleMax').value ?? 270,
        },
        child: {
            branchAngleMin: +document.getElementById('ChildAngle').value ?? -45,
            branchAngleMax: +document.getElementById('ChildAngleMax').value ?? 45,
            branchLengthMultiplierMin: +document.getElementById('ChildLength').value ?? 0.7,
            branchLengthMultiplierMax: +document.getElementById('ChildLengthMax').value ?? 0.85,
            branchWidthMultiplierMin: +document.getElementById('ChildWidth').value ?? 0.8,
            branchWidthMultiplierMax: +document.getElementById('ChildWidthMax').value ?? 0.9,
        },
    }

    treeDrawer.test(configuration);
}

document.getElementById('apply').addEventListener('click', () => restartSimulation());
