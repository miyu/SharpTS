declare global {
    type Color = string;
    interface Rect {
        x: number;
        y: number;
        width: number;
        height: number;
    }

    type FillStyle = any;
    type StrokeStyle = any;
    type Point2 = Array<number>;
    type Polygon = Array<Point2>;
    type Segment2 = Array<Point2>;

    enum Clockness {
        clockwise = -1,
        neither = 0,
        counterClockwise = 1
    }

    interface BoilerplateEngine {
        displayCanvas: HTMLCanvasElement;
        activeContext: CanvasRenderingContext2D;

        init (width: number, height: number, tickRate: number): void;
        setDisplaySize (width: number, height: number): void;

        createRenderContext (w: number, h: number): CanvasRenderingContext2D;
        createRenderTargetAndContext (w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D];

        createDisplaySizedRenderContext (): CanvasRenderingContext2D;
        createDisplaySizedRenderTargetAndContext (): [HTMLCanvasElement, CanvasRenderingContext2D];

        swapActiveRenderContext (context: CanvasRenderingContext2D): CanvasRenderingContext2D;

        onFrameEnter (cb: IFrameEnterCallback): void;
        onTickEnter (cb: ITickEnterCallback): void;

        assert (val: any, msg?: string): void;
        getScreenRect (): Rect;
        clear (c?: Color): void;
        clearRect (rect: Rect): void;
        clearRect (x: number, y: number, w: number, h: number): void;
        fillRect (fillStyle: FillStyle, rect: Rect): void;
        fillRect (fillStyle: FillStyle, x: number, y: number, w: number, h: number): void;
        fillEllipse (fillStyle: FillStyle, rect: Rect): void;
        fillEllipse (fillStyle: FillStyle, x: number, y: number, w: number, h: number): void;
        drawPoly (strokeStyle: StrokeStyle, poly: Polygon): void;
        fillPoly (fillStyle: FillStyle, poly: Polygon): void;
        drawLine (strokeStyle: StrokeStyle, x1: number, y1: number, x2: number, y2: number): void;
        drawLine(strokeStyle: StrokeStyle, p1: Point2, p2: Point2): void;

        makeRectangle (x: number, y: number, width: number, height: number): Rect;
        flattenRectangle (rect: Rect): Array<number>;
        checkOverlap (a: Rect, b: Rect): boolean;
        pointInRectangle(p: Point2, rect: Rect): boolean;
        randomDouble (min: number, max: number): number;
        randomInt (min: number, max: number): number;
        randomPoint (): Point2;
        pointInPolygon(p: Point2, poly: Polygon): boolean;

        add (a: Point2, b: Point2): Point2;
        sub (a: Point2, b: Point2): Point2;
        mul (a: Point2, s: number): Point2;
        cmul (a: Point2, s: Point2): Point2;
        div (a: Point2, s: number): Point2;
        dot (a: Point2, b: Point2): number;
        cross (a: Point2, b: Point2): number;
        sqnorm2d (a: Point2): number;
        norm2d (a: Point2): number;
        comp (v: Point2, basis: Point2): number;
        proj (v: Point2, basis: Point2): Point2;
        lerp<T> (a: T, b: T, t: number): T;
        rotate (p: Point2, theta: number): Point2;
        sqdist (a: Point2, b: Point2): number;
        dist (a: Point2, b: Point2): number;
        atan2 (a: Point2): number;
        perp (a: Point2): Point2;
        normalize (a: Point2): Point2;
        flip (a: Point2): Point2;
        within(val: number, low: number, high: number): boolean;

        clockness(a: Point2, b: Point2, c: Point2): Clockness;
        clockness(ba: Point2, bc: Point2): Clockness;
        clockness(ax: number, ay: number, bx: number, by: number, cx: number, cy: number): Clockness;
        clockness(bax: number, bay: number, bcx: number, bcy: number): Clockness;


        tryFindSegmentSegmentIntersectionT (a: Segment2, b: Segment2): number;
        tryFindSegmentSegmentIntersection (a: Segment2, b: Segment2): Point2;

        tryFindSegmentPolyIntersectionT (a: Segment2, b: Polygon): number;
        findSegmentPolyIntersectionTs (a: Segment2, b: Polygon): number[];
        tryFindSegmentPolyIntersection (a: Segment2, b: Polygon): Point2;
        findSegmentPolyIntersections (a: Segment2, b: Polygon): Point2[];
        findSegmentPolyIntersectionSegments (a: Segment2, b: Polygon): Segment2[];
        findNearestPointLineT (p: Point2, line: Segment2): number;
        findNearestPointSegmentT (p: Point2, line: Segment2): number;
        findNearestPointSegment (p: Point2, line: Segment2): Segment2;
        findNearestPointPoly (p: Point2, poly: Polygon): Point2;
        findRectangleLineIntersections (rect: Rect, line: Segment2): Point2[];
        findRectanglePolyIntersectionPoints (rect: Rect, poly: Polygon): Point2[];
        findRectanglePolyIntersectionSegments (rect: Rect, poly: Polygon): Segment2[];

        triwave (x: number): number;
        mapMany<T, U> (arr: T[], f: (x: T) => U[]): U[];
        enumerate (n: number): number[];
        enumerate<T>(arr: T[]): [number, T][];
        any<T>(arr: T[], pred: (x: T) => boolean): boolean;
        zip<T, U, V> (a: T[], b: U[], f: (x: T, y: U) => V): V[];
        zip3<T, U, V, W> (a: T[], b: U[], c: V[], f: (t: T, u: U, v: V) => W): W[];
        arrayify<T> (val: T): T | T[];

        createLinearGradient (p1: Point2, p2: Point2, c1: Color, c2: Color): CanvasGradient;
        setCompositeOperation (val: string): void;

        computeMeanTickExecutionTime(): number;
        computeMeanRenderExecutionTime(): number;
        computeMeanRenderInterval(): number;

        offsetSegment(s: Segment2, offset: number): Segment2;
    }

    interface Window extends BoilerplateEngine {
        Key: Key;
    }

    interface Key {
        isDown(key: string | number): boolean;
    }
}

export interface IFrameEnterCallback {
    (dt: number, t: number): void;
}

export interface ITickEnterCallback {
    (dt: number, t: number): void;
}
