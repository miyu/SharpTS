import { Clipper, ClipperOffset, ClipType, EndType, IntPoint, JoinType, PolyFillType, PolyNode, PolyTree, PolyType, createOutRefParam } from './Clipper';
import { Point as P2TPoint, Triangle, SweepContext } from 'poly2tri';

const engine: BoilerplateEngine = window;
const { Key: Key } = window;

import './style.scss';

var polys: [boolean, PolyTree][] = [];
var activePoly: IntPoint[] = [];
var activePolyIsHole = false;
var activePolyIsLine = false;

function b2c(this: void, p: number[]): IntPoint { return new IntPoint(p[0], p[1]); }
function c2b(this: void, p: IntPoint): number[] { return [p.X, p.Y]; }
function c2p(this: void, p: IntPoint): P2TPoint { return new P2TPoint(p.X, p.Y); }
function p2c(this: void, p: P2TPoint): IntPoint { return new IntPoint(p.x, p.y); }

function main() {
    engine.init(1280, 720, 60);
    engine.displayCanvas.className = 'render-view';

    engine.onTickEnter(tick);
    engine.onFrameEnter(render);

    window.addEventListener('resize', handleResize);
    window.addEventListener('resizestart', handleResize);
    window.addEventListener('resizeend', handleResize);

    engine.displayCanvas.addEventListener('click', handleClick);

    function handleClick(e: MouseEvent) {
        activePoly.push(new IntPoint(e.clientX, e.clientY));
    }

    function tick(dt: number, t: number) {
        if (t < 0.5) {
            handleResize();
        }

        if (Key.isDown('z')) activePolyIsHole = false;
        if (Key.isDown('x')) activePolyIsHole = true;
        if (Key.isDown('enter') && activePoly.length > 0) {
            polys = [[false, buildResultPolyTree(true)]];
            activePoly = [];
        }
        if (Key.isDown('a')) activePolyIsLine = false;
        if (Key.isDown('s')) activePolyIsLine = true;
        if (Key.isDown('escape')) activePoly = [];
    }

    function render(dt: number, t: number) {
        engine.clear('#222222');

        renderDebugStats();
        activePoly.forEach(p => engine.fillEllipse('#00FFFF', p.X - 5, p.Y - 5, 10, 10));

        var debug = Key.isDown('d');
        var preview = Key.isDown('p');
        if (debug) {
            if (preview) {
                var rpt = buildResultPolyTree(true);
                drawPolyNode(rpt, true, '#FF0000', '#FFFFFF', '#00FF00');
            } else {
                var rpt = buildResultPolyTree(false);
                drawPolyNode(rpt, true, '#FF0000', '#FFFFFF', '#00FF00');
                drawPolyNode(buildActivePolyTree(), true, '#7F0000', '#7F7F7F', '#007F00');
            }
        } else if (preview) {
            var rpt = buildResultPolyTree(true);
            fillPolyNode(rpt, true, '#EEEEEE', '#333333');
        } else {
            var rpt = buildResultPolyTree(false);
            fillPolyNode(rpt, true, '#EEEEEE', '#333333');

            if (activePoly.length > 1) {
                for (var i = 0; i < (activePolyIsLine ? activePoly.length - 1 : activePoly.length); i++) {
                    var a = activePoly[i];
                    var b = activePoly[(i + 1) % activePoly.length];
                    engine.drawLine('#00FFFF', a.X, a.Y, b.X, b.Y);
                }

                var activePolyTree = buildActivePolyTree();
                fillPolyNode(
                    activePolyTree,
                    true,
                    activePolyIsHole ? 'rgba(255, 0, 0, 0.2)' : 'rgba(0, 255, 255, 0.2)', 
                    activePolyIsHole ? 'rgba(255, 0, 0, 0.4)' : 'rgba(0, 255, 255, 0.4)');
            }
        }
    }

    function buildActivePolyTree(): PolyTree {
        if (activePolyIsLine) {
            var ps: IntPoint[] = [].concat(activePoly, [].concat(activePoly).reverse());

            var offset = new ClipperOffset();
            offset.AddPath(ps, JoinType.jtRound, EndType.etClosedLine);

            var result: PolyTree = new PolyTree();
            var bufferBy = 10;
            offset.Execute(createOutRefParam(() => result, (val) => result = val), bufferBy);
            return result;
        } else {
            var clipper = new Clipper(Clipper.ioStrictlySimple);
            
            clipper.AddPath([].concat(activePoly, [activePoly[0]]), PolyType.ptSubject, true);

            var result: PolyTree = new PolyTree();
            clipper.Execute(ClipType.ctUnion, result, PolyFillType.pftEvenOdd);

            return result;
        }
    }

    function buildResultPolyTree(includeActivePolyTree: boolean) {
        var clipper = new Clipper(Clipper.ioStrictlySimple);
        const visit = (n: PolyNode, isHole: boolean, polyType: PolyType) => {
            if (n.Contour.length > 0) {
                var ps = n.Contour.concat([]);
                if (ps[0].opNotEquals(ps[ps.length - 1])) {
                    ps.push(ps[0].zzz__sharpjs_clone());
                }   
                clipper.AddPath(ps, polyType, true);
            }
            n.Childs.forEach(c => visit(c, !isHole, polyType));
        };
        polys.forEach(([isHole, pt]) => visit(pt, isHole, PolyType.ptSubject));
        if (includeActivePolyTree) {
            visit(buildActivePolyTree(), false, PolyType.ptClip);
        }

        var result: PolyTree = new PolyTree();
        clipper.Execute(activePolyIsHole ? ClipType.ctDifference : ClipType.ctUnion, result, PolyFillType.pftPositive);

        return result;
    }

    function drawPolyNode(n: PolyNode, isHole: boolean, holeColor: string, landColor: string, pointColor: string) {
        n.Contour.forEach(p => engine.fillEllipse(pointColor, p.X - 2, p.Y - 2, 4, 4));

        var contour = n.Contour.map(c2b);
        if (contour.length > 1) {
            engine.drawPoly(isHole ? holeColor : landColor, n.Contour.map(c2b));
        }

        for (var child of n.Childs) {
            drawPolyNode(child, !isHole, holeColor, landColor, pointColor);
        }
    }
    function fillPolyNode(n: PolyNode, isHole: boolean, interiorColor: string, edgeColor: string) {
        if (!isHole && n.Contour.length > 0) {
            const sc = new SweepContext(n.Contour.map(c2p));
            for (var child of n.Childs) {
                sc.addHole(child.Contour.map(c2p));
            }
            try {
                sc.triangulate();
                for (var tri of sc.getTriangles()) {
                    var poly = tri.getPoints().map(p2c).map(c2b);
                    engine.fillPoly(interiorColor, poly);
                    for (var i = 0; i < 3; i++) engine.drawLine(edgeColor, poly[i], poly[(i + 1) % 3]);
                }
            } catch (e) {
                console.log(n.Contour);
                for (var child of n.Childs) {
                    console.log(child.Contour);
                }
                console.log('p2t error', e);
            }
        }

        for (var child of n.Childs) {
            fillPolyNode(child, !isHole, interiorColor, edgeColor);
        }
    }

    function renderDebugStats() {
        const formatDecimal = (x: number) => x.toFixed(2);
        const ctx = engine.displayCanvas.getContext('2d');
        ctx.fillStyle = '#FFFFFF';
        let stats = `MTE ${formatDecimal(1000 * engine.computeMeanTickExecutionTime())}ms`;
        stats += ` | MRE ${formatDecimal(1000 * engine.computeMeanRenderExecutionTime())}ms `;
        stats += ` | MRI ${formatDecimal(1000 * engine.computeMeanRenderInterval())}ms`;
        stats += ` | FPS ~${formatDecimal(1 / engine.computeMeanRenderInterval())}`;
        stats += ` | RES ${engine.getScreenRect().width} x ${engine.getScreenRect().height}`;
        ctx.fillText(stats, 0, 10);

        ctx.fillText("z: land; x: hole; c: done; a: poly mode; s: line mode; esc: cancel; click: insert point", 0, 20);
    }

    function handleResize() {
        engine.setDisplaySize(document.body.clientWidth, document.body.clientHeight);
        engine.displayCanvas.style.width = document.body.clientWidth + 'px';
        engine.displayCanvas.style.height = document.body.clientHeight + 'px';
    }
}


window.addEventListener('load', main);