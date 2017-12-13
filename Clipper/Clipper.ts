/* SharpJS - Emitted on 12/12/2017 10:56:22 PM */
class OutRefParam<T> { 
   constructor (public read: () => T, public write: (val: T) => T) { }
}
function createOutRefParam<T>(read: () => T, write: (val: T) => T): OutRefParam<T> { return new OutRefParam<T>(read, write); }

interface IComparer<T> { Compare(a : T, b : T): number; }
class SharpJsHelpers { 
   static conditionalAccess(val, next) { 
      return val ? next(val) : val;
   }
   static valueClone(val) { 
      if (!val || typeof val !== 'object') return val;
      if (val.zzz__sharpjs_clone) return val.zzz__sharpjs_clone();
      return val;
   }
   static arrayClear(arr) { 
      while(arr.length) arr.pop();
   }
   static TestTypeCheck(x, type) {
      if (type === 'object') return typeof(x) == 'object' || x instanceof Object || x == null;
      if (type === 'string') return typeof(x) == 'string' || x instanceof String;
      if (typeof(type) === 'string') return typeof(x) == type;
      if (typeof(type) === 'function') return x instanceof type;
      return false;
   }
   static readThenExec<T>(read: () => T, exec: (val: T) => void ): T {
      const res : T = read();
      exec(res);
      return res;
   }
   static booleanXor(x: boolean, y: boolean): boolean {
      return x != y && (x || y);
   }
   static setCapacity<T>(arr: Array<T>, capacity: number): number {
      if (arr.length > capacity) arr.length = capacity; // don't resize upward.
      return capacity;
   }
   static tryBinaryOperator<T, R>(a: T, b: T, op: string, fallback: (a: T, b: T) => R) {
      return (op in <any>a) ? (<any>a)[op](b) : fallback(a, b);
   }
}


export class PolyNode {
   public m_Parent : PolyNode = null;
   public m_polygon : Array<IntPoint> = new Array<IntPoint>();
   public m_Index : number = 0;
   public m_jointype : JoinType = <JoinType>0;
   public m_endtype : EndType = <EndType>0;
   public m_Childs : Array<PolyNode> = new Array<PolyNode>();
   
   constructor(...args: any[]) {
   }
   
   get ChildCount(): number {
      return this.m_Childs.length;
   }
   get Contour(): Array<IntPoint> {
      return this.m_polygon;
   }
   get Childs(): Array<PolyNode> {
      return this.m_Childs;
   }
   get Parent(): PolyNode {
      return this.m_Parent;
   }
   get IsHole(): boolean {
      return this.IsHoleNode();
   }
   private m_IsOpen : boolean = false;
   get IsOpen(): boolean { return this.m_IsOpen; }
   set IsOpen(value: boolean) { this.m_IsOpen = SharpJsHelpers.valueClone(value); }
   private IsHoleNode() : boolean {
      let result : boolean = true;
      let node : PolyNode = this.m_Parent;
      while (node !== null) {
         result = SharpJsHelpers.valueClone(!result);
         node = node.m_Parent;
      }
      return result;
   }
   
   public AddChild(Child : PolyNode) : void {
      let cnt : number = this.m_Childs.length;
      this.m_Childs.push(Child);
      Child.m_Parent = this;
      Child.m_Index = SharpJsHelpers.valueClone(cnt);
   }
   
   public GetNext() : PolyNode {
      if (this.m_Childs.length > 0) return this.m_Childs[0];
      else return this.GetNextSiblingUp();
   }
   
   public GetNextSiblingUp() : PolyNode {
      if (this.m_Parent === null) return null;
      else if (this.m_Index === this.m_Parent.m_Childs.length - 1) return this.m_Parent.GetNextSiblingUp();
      else return this.m_Parent.m_Childs[this.m_Index + 1];
   }
   
}

export class PolyTree extends PolyNode {
   public m_AllPolys : Array<PolyNode> = new Array<PolyNode>();
   
   constructor(...args: any[]) {
      super();
   }
   
   get Total(): number {
      let result : number = this.m_AllPolys.length;
      if (result > 0 && this.m_Childs[0] !== this.m_AllPolys[0]) result--;
      return result;
   }
   public Clear() : void {
      for (let i : number = 0; i < this.m_AllPolys.length; i++) this.m_AllPolys[i] = null;
      SharpJsHelpers.arrayClear(this.m_AllPolys);
      SharpJsHelpers.arrayClear(this.m_Childs);
   }
   
   public GetFirst() : PolyNode {
      if (this.m_Childs.length > 0) return this.m_Childs[0];
      else return null;
   }
   
}

export class TEdge {
   public Bot : IntPoint = IntPoint.default();
   public Curr : IntPoint = IntPoint.default();
   public Top : IntPoint = IntPoint.default();
   public Delta : IntPoint = IntPoint.default();
   public Dx : number = 0;
   public PolyTyp : PolyType = <PolyType>0;
   public Side : EdgeSide = <EdgeSide>0;
   public WindDelta : number = 0;
   public WindCnt : number = 0;
   public WindCnt2 : number = 0;
   public OutIdx : number = 0;
   public Next : TEdge = null;
   public Prev : TEdge = null;
   public NextInLML : TEdge = null;
   public NextInAEL : TEdge = null;
   public PrevInAEL : TEdge = null;
   public NextInSEL : TEdge = null;
   public PrevInSEL : TEdge = null;
   
   constructor(...args: any[]) {
   }
   
}

export class IntersectNode {
   public Edge1 : TEdge = null;
   public Edge2 : TEdge = null;
   public Pt : IntPoint = IntPoint.default();
   
   constructor(...args: any[]) {
   }
   
}

export class MyIntersectNodeSort implements IComparer<IntersectNode> {
   constructor(...args: any[]) {
   }
   
   public Compare(node1 : IntersectNode, node2 : IntersectNode) : number {
      let i : number = node2.Pt.Y - node1.Pt.Y;
      if (i > 0) return 1;
      else if (i < 0) return -1;
      else return 0;
   }
   
}

export class LocalMinima {
   public Y : number = 0;
   public LeftBound : TEdge = null;
   public RightBound : TEdge = null;
   public Next : LocalMinima = null;
   
   constructor(...args: any[]) {
   }
   
}

export class Scanbeam {
   public Y : number = 0;
   public Next : Scanbeam = null;
   
   constructor(...args: any[]) {
   }
   
}

export class Maxima {
   public X : number = 0;
   public Next : Maxima = null;
   public Prev : Maxima = null;
   
   constructor(...args: any[]) {
   }
   
}

export class OutRec {
   public Idx : number = 0;
   public IsHole : boolean = false;
   public IsOpen : boolean = false;
   public FirstLeft : OutRec = null;
   public Pts : OutPt = null;
   public BottomPt : OutPt = null;
   public PolyNode : PolyNode = null;
   
   constructor(...args: any[]) {
   }
   
}

export class OutPt {
   public Idx : number = 0;
   public Pt : IntPoint = IntPoint.default();
   public Next : OutPt = null;
   public Prev : OutPt = null;
   
   constructor(...args: any[]) {
   }
   
}

export class Join {
   public OutPt1 : OutPt = null;
   public OutPt2 : OutPt = null;
   public OffPt : IntPoint = IntPoint.default();
   
   constructor(...args: any[]) {
   }
   
}

export class ClipperBase {
   public static readonly horizontal : number = -3.4E+38;
   public static readonly Skip : number = -2;
   public static readonly Unassigned : number = -1;
   public static readonly tolerance : number = 1.0E-20;
   public static readonly loRange : number = 0x7FFF;
   public static readonly hiRange : number = 0x7FFF;
   public m_MinimaList : LocalMinima = null;
   public m_CurrentLM : LocalMinima = null;
   public m_edges : Array<Array<TEdge>> = new Array<Array<TEdge>>();
   public m_Scanbeam : Scanbeam = null;
   public m_PolyOuts : Array<OutRec> = null;
   public m_ActiveEdges : TEdge = null;
   public m_UseFullRange : boolean = false;
   public m_HasOpenPaths : boolean = false;
   
   public constructor_SharpJs_Overload_0() {
      this.m_MinimaList = null;
      this.m_CurrentLM = null;
      this.m_UseFullRange = SharpJsHelpers.valueClone(false);
      this.m_HasOpenPaths = SharpJsHelpers.valueClone(false);
   }
   
   public constructor();
   public constructor(...args: any[]) {
      if (args.length == 0) { this.constructor_SharpJs_Overload_0(); return; }
      throw new Error('SharpJS: Failed to match method overload. This can be due to differences in C#/JS type system.');
   }
   
   private m_PreserveCollinear : boolean = false;
   get PreserveCollinear(): boolean { return this.m_PreserveCollinear; }
   set PreserveCollinear(value: boolean) { this.m_PreserveCollinear = SharpJsHelpers.valueClone(value); }
   public static near_zero(val : number) : boolean {
      return (val > -ClipperBase.tolerance) && (val < ClipperBase.tolerance);
   }
   
   public Swap(val1 : OutRefParam<number>, val2 : OutRefParam<number>) : void {
      let tmp : number = val1.read();
      val1.write(SharpJsHelpers.valueClone(val2.read()));
      val2.write(SharpJsHelpers.valueClone(tmp));
   }
   
   public static IsHorizontal(e : TEdge) : boolean {
      return e.Delta.Y === 0;
   }
   
   public PointIsVertex(pt : IntPoint, pp : OutPt) : boolean {
      let pp2 : OutPt = pp;
      do {{
         if (SharpJsHelpers.tryBinaryOperator(pp2.Pt, pt, 'opEquals', (a, b) => a == b)) return true;
         pp2 = pp2.Next;
      }
      } while(pp2 !== pp);return false;
   }
   
   public PointOnLineSegment(pt : IntPoint, linePt1 : IntPoint, linePt2 : IntPoint, UseFullRange : boolean) : boolean {
      if (UseFullRange) return ((pt.X === linePt1.X) && (pt.Y === linePt1.Y)) || ((pt.X === linePt2.X) && (pt.Y === linePt2.Y)) || (((pt.X > linePt1.X) === (pt.X < linePt2.X)) && ((pt.Y > linePt1.Y) === (pt.Y < linePt2.Y)) && ((SharpJsHelpers.tryBinaryOperator(Int128.Int128Mul((pt.X - linePt1.X), (linePt2.Y - linePt1.Y)), Int128.Int128Mul((linePt2.X - linePt1.X), (pt.Y - linePt1.Y)), 'opEquals', (a, b) => a == b))));
      else return ((pt.X === linePt1.X) && (pt.Y === linePt1.Y)) || ((pt.X === linePt2.X) && (pt.Y === linePt2.Y)) || (((pt.X > linePt1.X) === (pt.X < linePt2.X)) && ((pt.Y > linePt1.Y) === (pt.Y < linePt2.Y)) && ((pt.X - linePt1.X) * (linePt2.Y - linePt1.Y) === (linePt2.X - linePt1.X) * (pt.Y - linePt1.Y)));
   }
   
   public PointOnPolygon(pt : IntPoint, pp : OutPt, UseFullRange : boolean) : boolean {
      let pp2 : OutPt = pp;
      while (true) {
         if (this.PointOnLineSegment(pt, pp2.Pt, pp2.Next.Pt, UseFullRange)) return true;
         pp2 = pp2.Next;
         if (pp2 === pp) break;
      }
      return false;
   }
   
   public static SlopesEqual_SharpJs_Overload_0(e1 : TEdge, e2 : TEdge, UseFullRange : boolean) : boolean {
      if (UseFullRange) return SharpJsHelpers.tryBinaryOperator(Int128.Int128Mul(e1.Delta.Y, e2.Delta.X), Int128.Int128Mul(e1.Delta.X, e2.Delta.Y), 'opEquals', (a, b) => a == b);
      else return <number>(e1.Delta.Y) * (e2.Delta.X) === <number>(e1.Delta.X) * (e2.Delta.Y);
   }
   
   public static SlopesEqual_SharpJs_Overload_1(pt1 : IntPoint, pt2 : IntPoint, pt3 : IntPoint, UseFullRange : boolean) : boolean {
      if (UseFullRange) return SharpJsHelpers.tryBinaryOperator(Int128.Int128Mul(pt1.Y - pt2.Y, pt2.X - pt3.X), Int128.Int128Mul(pt1.X - pt2.X, pt2.Y - pt3.Y), 'opEquals', (a, b) => a == b);
      else return <number>(pt1.Y - pt2.Y) * (pt2.X - pt3.X) - <number>(pt1.X - pt2.X) * (pt2.Y - pt3.Y) === 0;
   }
   
   public static SlopesEqual_SharpJs_Overload_2(pt1 : IntPoint, pt2 : IntPoint, pt3 : IntPoint, pt4 : IntPoint, UseFullRange : boolean) : boolean {
      if (UseFullRange) return SharpJsHelpers.tryBinaryOperator(Int128.Int128Mul(pt1.Y - pt2.Y, pt3.X - pt4.X), Int128.Int128Mul(pt1.X - pt2.X, pt3.Y - pt4.Y), 'opEquals', (a, b) => a == b);
      else return <number>(pt1.Y - pt2.Y) * (pt3.X - pt4.X) - <number>(pt1.X - pt2.X) * (pt3.Y - pt4.Y) === 0;
   }
   
   public static SlopesEqual(e1 : TEdge, e2 : TEdge, UseFullRange : boolean) : boolean;
   public static SlopesEqual(pt1 : IntPoint, pt2 : IntPoint, pt3 : IntPoint, UseFullRange : boolean) : boolean;
   public static SlopesEqual(pt1 : IntPoint, pt2 : IntPoint, pt3 : IntPoint, pt4 : IntPoint, UseFullRange : boolean) : boolean;
   public static SlopesEqual(...args: any[]): boolean | boolean | boolean {
      if (args.length == 3 && SharpJsHelpers.TestTypeCheck(args[0], TEdge) && SharpJsHelpers.TestTypeCheck(args[1], TEdge) && SharpJsHelpers.TestTypeCheck(args[2], 'boolean')) return ClipperBase.SlopesEqual_SharpJs_Overload_0(<TEdge>args[0], <TEdge>args[1], <boolean>args[2]);
      else if (args.length == 4 && SharpJsHelpers.TestTypeCheck(args[0], IntPoint) && SharpJsHelpers.TestTypeCheck(args[1], IntPoint) && SharpJsHelpers.TestTypeCheck(args[2], IntPoint) && SharpJsHelpers.TestTypeCheck(args[3], 'boolean')) return ClipperBase.SlopesEqual_SharpJs_Overload_1(<IntPoint>args[0], <IntPoint>args[1], <IntPoint>args[2], <boolean>args[3]);
      else if (args.length == 5 && SharpJsHelpers.TestTypeCheck(args[0], IntPoint) && SharpJsHelpers.TestTypeCheck(args[1], IntPoint) && SharpJsHelpers.TestTypeCheck(args[2], IntPoint) && SharpJsHelpers.TestTypeCheck(args[3], IntPoint) && SharpJsHelpers.TestTypeCheck(args[4], 'boolean')) return ClipperBase.SlopesEqual_SharpJs_Overload_2(<IntPoint>args[0], <IntPoint>args[1], <IntPoint>args[2], <IntPoint>args[3], <boolean>args[4]);
      throw new Error('SharpJS: Failed to match method overload. This can be due to differences in C#/JS type system.');
   }
   
   public Clear() : void {
      this.DisposeLocalMinimaList();
      for (let i : number = 0; i < this.m_edges.length; ++i) {
         for (let j : number = 0; j < this.m_edges[i].length; ++j) this.m_edges[i][j] = null;
         SharpJsHelpers.arrayClear(this.m_edges[i]);
      }
      SharpJsHelpers.arrayClear(this.m_edges);
      this.m_UseFullRange = SharpJsHelpers.valueClone(false);
      this.m_HasOpenPaths = SharpJsHelpers.valueClone(false);
   }
   
   private DisposeLocalMinimaList() : void {
      while (this.m_MinimaList !== null) {
         let tmpLm : LocalMinima = this.m_MinimaList.Next;
         this.m_MinimaList = null;
         this.m_MinimaList = tmpLm;
      }
      this.m_CurrentLM = null;
   }
   
   RangeTest(Pt : IntPoint, useFullRange : OutRefParam<boolean>) : void {
      if (useFullRange.read()) {
         if (Pt.X > ClipperBase.hiRange || Pt.Y > ClipperBase.hiRange || -Pt.X > ClipperBase.hiRange || -Pt.Y > ClipperBase.hiRange) throw new ClipperException("Coordinate outside allowed range");
      }
      else if (Pt.X > ClipperBase.loRange || Pt.Y > ClipperBase.loRange || -Pt.X > ClipperBase.loRange || -Pt.Y > ClipperBase.loRange) {
         useFullRange.write(SharpJsHelpers.valueClone(true));
         this.RangeTest(Pt, useFullRange);
      }
   }
   
   private InitEdge(e : TEdge, eNext : TEdge, ePrev : TEdge, pt : IntPoint) : void {
      e.Next = eNext;
      e.Prev = ePrev;
      e.Curr = SharpJsHelpers.valueClone(pt);
      e.OutIdx = SharpJsHelpers.valueClone(ClipperBase.Unassigned);
   }
   
   private InitEdge2(e : TEdge, polyType : PolyType) : void {
      if (e.Curr.Y >= e.Next.Curr.Y) {
         e.Bot = SharpJsHelpers.valueClone(e.Curr);
         e.Top = SharpJsHelpers.valueClone(e.Next.Curr);
      }
      else {
         e.Top = SharpJsHelpers.valueClone(e.Curr);
         e.Bot = SharpJsHelpers.valueClone(e.Next.Curr);
      }
      this.SetDx(e);
      e.PolyTyp = SharpJsHelpers.valueClone(polyType);
   }
   
   private FindNextLocMin(E : TEdge) : TEdge {
      let E2 : TEdge = null;
      for (; ; ) {
         while (SharpJsHelpers.tryBinaryOperator(E.Bot, E.Prev.Bot, 'opNotEquals', (a, b) => a != b) || SharpJsHelpers.tryBinaryOperator(E.Curr, E.Top, 'opEquals', (a, b) => a == b)) E = E.Next;
         if (E.Dx !== ClipperBase.horizontal && E.Prev.Dx !== ClipperBase.horizontal) break;
         while (E.Prev.Dx === ClipperBase.horizontal) E = E.Prev;
         E2 = E;
         while (E.Dx === ClipperBase.horizontal) E = E.Next;
         if (E.Top.Y === E.Prev.Bot.Y) continue;
         if (E2.Prev.Bot.X < E.Bot.X) E = E2;
         break;
      }
      return E;
   }
   
   private ProcessBound(E : TEdge, LeftBoundIsForward : boolean) : TEdge {
      let EStart : TEdge = null, Result : TEdge = E;
      let Horz : TEdge = null;
      if (Result.OutIdx === ClipperBase.Skip) {
         E = Result;
         if (LeftBoundIsForward) {
            while (E.Top.Y === E.Next.Bot.Y) E = E.Next;
            while (E !== Result && E.Dx === ClipperBase.horizontal) E = E.Prev;
         }
         else {
            while (E.Top.Y === E.Prev.Bot.Y) E = E.Prev;
            while (E !== Result && E.Dx === ClipperBase.horizontal) E = E.Next;
         }
         if (E === Result) {
            if (LeftBoundIsForward) Result = E.Next;
            else Result = E.Prev;
         }
         else {
            if (LeftBoundIsForward) E = Result.Next;
            else E = Result.Prev;
            let locMin : LocalMinima = new LocalMinima();
            locMin.Next = null;
            locMin.Y = SharpJsHelpers.valueClone(E.Bot.Y);
            locMin.LeftBound = null;
            locMin.RightBound = E;
            E.WindDelta = SharpJsHelpers.valueClone(0);
            Result = this.ProcessBound(E, LeftBoundIsForward);
            this.InsertLocalMinima(locMin);
         }
         return Result;
      }
      if (E.Dx === ClipperBase.horizontal) {
         if (LeftBoundIsForward) EStart = E.Prev;
         else EStart = E.Next;
         if (EStart.Dx === ClipperBase.horizontal) {
            if (EStart.Bot.X !== E.Bot.X && EStart.Top.X !== E.Bot.X) this.ReverseHorizontal(E);
         }
         else if (EStart.Bot.X !== E.Bot.X) this.ReverseHorizontal(E);
      }
      EStart = E;
      if (LeftBoundIsForward) {
         while (Result.Top.Y === Result.Next.Bot.Y && Result.Next.OutIdx !== ClipperBase.Skip) Result = Result.Next;
         if (Result.Dx === ClipperBase.horizontal && Result.Next.OutIdx !== ClipperBase.Skip) {
            Horz = Result;
            while (Horz.Prev.Dx === ClipperBase.horizontal) Horz = Horz.Prev;
            if (Horz.Prev.Top.X > Result.Next.Top.X) Result = Horz.Prev;
         }
         while (E !== Result) {
            E.NextInLML = E.Next;
            if (E.Dx === ClipperBase.horizontal && E !== EStart && E.Bot.X !== E.Prev.Top.X) this.ReverseHorizontal(E);
            E = E.Next;
         }
         if (E.Dx === ClipperBase.horizontal && E !== EStart && E.Bot.X !== E.Prev.Top.X) this.ReverseHorizontal(E);
         Result = Result.Next;
      }
      else {
         while (Result.Top.Y === Result.Prev.Bot.Y && Result.Prev.OutIdx !== ClipperBase.Skip) Result = Result.Prev;
         if (Result.Dx === ClipperBase.horizontal && Result.Prev.OutIdx !== ClipperBase.Skip) {
            Horz = Result;
            while (Horz.Next.Dx === ClipperBase.horizontal) Horz = Horz.Next;
            if (Horz.Next.Top.X === Result.Prev.Top.X || Horz.Next.Top.X > Result.Prev.Top.X) Result = Horz.Next;
         }
         while (E !== Result) {
            E.NextInLML = E.Prev;
            if (E.Dx === ClipperBase.horizontal && E !== EStart && E.Bot.X !== E.Next.Top.X) this.ReverseHorizontal(E);
            E = E.Prev;
         }
         if (E.Dx === ClipperBase.horizontal && E !== EStart && E.Bot.X !== E.Next.Top.X) this.ReverseHorizontal(E);
         Result = Result.Prev;
      }
      return Result;
   }
   
   public AddPath(pg : Array<IntPoint>, polyType : PolyType, Closed : boolean) : boolean {
      if (!Closed && polyType === PolyType.ptClip) throw new ClipperException("AddPath: Open paths must be subject.");
      let highI : number = <number>pg.length - 1;
      if (Closed) while (highI > 0 && (SharpJsHelpers.tryBinaryOperator(pg[highI], pg[0], 'opEquals', (a, b) => a == b))) --highI;
      while (highI > 0 && (SharpJsHelpers.tryBinaryOperator(pg[highI], pg[highI - 1], 'opEquals', (a, b) => a == b))) --highI;
      if ((Closed && highI < 2) || (!Closed && highI < 1)) return false;
      let edges : Array<TEdge> = new Array<TEdge>();
      for (let i : number = 0; i <= highI; i++) edges.push(new TEdge());
      let IsFlat : boolean = true;
      edges[1].Curr = SharpJsHelpers.valueClone(pg[1]);
      this.RangeTest(pg[0], createOutRefParam(() => { return SharpJsHelpers.valueClone(this.m_UseFullRange); }, (__value) => { this.m_UseFullRange = __value; return SharpJsHelpers.valueClone(__value); }));
      this.RangeTest(pg[highI], createOutRefParam(() => { return SharpJsHelpers.valueClone(this.m_UseFullRange); }, (__value) => { this.m_UseFullRange = __value; return SharpJsHelpers.valueClone(__value); }));
      this.InitEdge(edges[0], edges[1], edges[highI], pg[0]);
      this.InitEdge(edges[highI], edges[0], edges[highI - 1], pg[highI]);
      for (let i : number = highI - 1; i >= 1; --i) {
         this.RangeTest(pg[i], createOutRefParam(() => { return SharpJsHelpers.valueClone(this.m_UseFullRange); }, (__value) => { this.m_UseFullRange = __value; return SharpJsHelpers.valueClone(__value); }));
         this.InitEdge(edges[i], edges[i + 1], edges[i - 1], pg[i]);
      }
      let eStart : TEdge = edges[0];
      let E : TEdge = eStart, eLoopStop : TEdge = eStart;
      for (; ; ) {
         if (SharpJsHelpers.tryBinaryOperator(E.Curr, E.Next.Curr, 'opEquals', (a, b) => a == b) && (Closed || E.Next !== eStart)) {
            if (E === E.Next) break;
            if (E === eStart) eStart = E.Next;
            E = this.RemoveEdge(E);
            eLoopStop = E;
            continue;
         }
         if (E.Prev === E.Next) break;
         else if (Closed && ClipperBase.SlopesEqual(E.Prev.Curr, E.Curr, E.Next.Curr, this.m_UseFullRange) && (!this.PreserveCollinear || !this.Pt2IsBetweenPt1AndPt3(E.Prev.Curr, E.Curr, E.Next.Curr))) {
            if (E === eStart) eStart = E.Next;
            E = this.RemoveEdge(E);
            E = E.Prev;
            eLoopStop = E;
            continue;
         }
         E = E.Next;
         if ((E === eLoopStop) || (!Closed && E.Next === eStart)) break;
      }
      if ((!Closed && (E === E.Next)) || (Closed && (E.Prev === E.Next))) return false;
      if (!Closed) {
         this.m_HasOpenPaths = SharpJsHelpers.valueClone(true);
         eStart.Prev.OutIdx = SharpJsHelpers.valueClone(ClipperBase.Skip);
      }
      E = eStart;
      do {{
         this.InitEdge2(E, polyType);
         E = E.Next;
         if (IsFlat && E.Curr.Y !== eStart.Curr.Y) IsFlat = SharpJsHelpers.valueClone(false);
      }
      } while(E !== eStart);if (IsFlat) {
         if (Closed) return false;
         E.Prev.OutIdx = SharpJsHelpers.valueClone(ClipperBase.Skip);
         let locMin : LocalMinima = new LocalMinima();
         locMin.Next = null;
         locMin.Y = SharpJsHelpers.valueClone(E.Bot.Y);
         locMin.LeftBound = null;
         locMin.RightBound = E;
         locMin.RightBound.Side = SharpJsHelpers.valueClone(EdgeSide.esRight);
         locMin.RightBound.WindDelta = SharpJsHelpers.valueClone(0);
         for (; ; ) {
            if (E.Bot.X !== E.Prev.Top.X) this.ReverseHorizontal(E);
            if (E.Next.OutIdx === ClipperBase.Skip) break;
            E.NextInLML = E.Next;
            E = E.Next;
         }
         this.InsertLocalMinima(locMin);
         this.m_edges.push(edges);
         return true;
      }
      this.m_edges.push(edges);
      let leftBoundIsForward : boolean = false;
      let EMin : TEdge = null;
      if (SharpJsHelpers.tryBinaryOperator(E.Prev.Bot, E.Prev.Top, 'opEquals', (a, b) => a == b)) E = E.Next;
      for (; ; ) {
         E = this.FindNextLocMin(E);
         if (E === EMin) break;
         else if (EMin === null) EMin = E;
         let locMin : LocalMinima = new LocalMinima();
         locMin.Next = null;
         locMin.Y = SharpJsHelpers.valueClone(E.Bot.Y);
         if (E.Dx < E.Prev.Dx) {
            locMin.LeftBound = E.Prev;
            locMin.RightBound = E;
            leftBoundIsForward = SharpJsHelpers.valueClone(false);
         }
         else {
            locMin.LeftBound = E;
            locMin.RightBound = E.Prev;
            leftBoundIsForward = SharpJsHelpers.valueClone(true);
         }
         locMin.LeftBound.Side = SharpJsHelpers.valueClone(EdgeSide.esLeft);
         locMin.RightBound.Side = SharpJsHelpers.valueClone(EdgeSide.esRight);
         if (!Closed) locMin.LeftBound.WindDelta = SharpJsHelpers.valueClone(0);
         else if (locMin.LeftBound.Next === locMin.RightBound) locMin.LeftBound.WindDelta = SharpJsHelpers.valueClone(-1);
         else locMin.LeftBound.WindDelta = SharpJsHelpers.valueClone(1);
         locMin.RightBound.WindDelta = SharpJsHelpers.valueClone(-locMin.LeftBound.WindDelta);
         E = this.ProcessBound(locMin.LeftBound, leftBoundIsForward);
         if (E.OutIdx === ClipperBase.Skip) E = this.ProcessBound(E, leftBoundIsForward);
         let E2 : TEdge = this.ProcessBound(locMin.RightBound, !leftBoundIsForward);
         if (E2.OutIdx === ClipperBase.Skip) E2 = this.ProcessBound(E2, !leftBoundIsForward);
         if (locMin.LeftBound.OutIdx === ClipperBase.Skip) locMin.LeftBound = null;
         else if (locMin.RightBound.OutIdx === ClipperBase.Skip) locMin.RightBound = null;
         this.InsertLocalMinima(locMin);
         if (!leftBoundIsForward) E = E2;
      }
      return true;
   }
   
   public AddPaths(ppg : Array<Array<IntPoint>>, polyType : PolyType, closed : boolean) : boolean {
      let result : boolean = false;
      for (let i : number = 0; i < ppg.length; ++i) if (this.AddPath(ppg[i], polyType, closed)) result = SharpJsHelpers.valueClone(true);
      return result;
   }
   
   public Pt2IsBetweenPt1AndPt3(pt1 : IntPoint, pt2 : IntPoint, pt3 : IntPoint) : boolean {
      if ((SharpJsHelpers.tryBinaryOperator(pt1, pt3, 'opEquals', (a, b) => a == b)) || (SharpJsHelpers.tryBinaryOperator(pt1, pt2, 'opEquals', (a, b) => a == b)) || (SharpJsHelpers.tryBinaryOperator(pt3, pt2, 'opEquals', (a, b) => a == b))) return false;
      else if (pt1.X !== pt3.X) return (pt2.X > pt1.X) === (pt2.X < pt3.X);
      else return (pt2.Y > pt1.Y) === (pt2.Y < pt3.Y);
   }
   
   RemoveEdge(e : TEdge) : TEdge {
      e.Prev.Next = e.Next;
      e.Next.Prev = e.Prev;
      let result : TEdge = e.Next;
      e.Prev = null;
      return result;
   }
   
   private SetDx(e : TEdge) : void {
      e.Delta.X = SharpJsHelpers.valueClone((e.Top.X - e.Bot.X));
      e.Delta.Y = SharpJsHelpers.valueClone((e.Top.Y - e.Bot.Y));
      if (e.Delta.Y === 0) e.Dx = SharpJsHelpers.valueClone(ClipperBase.horizontal);
      else e.Dx = SharpJsHelpers.valueClone(<number>(e.Delta.X) / (e.Delta.Y));
   }
   
   private InsertLocalMinima(newLm : LocalMinima) : void {
      if (this.m_MinimaList === null) {
         this.m_MinimaList = newLm;
      }
      else if (newLm.Y >= this.m_MinimaList.Y) {
         newLm.Next = this.m_MinimaList;
         this.m_MinimaList = newLm;
      }
      else {
         let tmpLm : LocalMinima = this.m_MinimaList;
         while (tmpLm.Next !== null && (newLm.Y < tmpLm.Next.Y)) tmpLm = tmpLm.Next;
         newLm.Next = tmpLm.Next;
         tmpLm.Next = newLm;
      }
   }
   
   public PopLocalMinima(Y : number, current : OutRefParam<LocalMinima>) : boolean {
      current.write(this.m_CurrentLM);
      if (this.m_CurrentLM !== null && this.m_CurrentLM.Y === Y) {
         this.m_CurrentLM = this.m_CurrentLM.Next;
         return true;
      }
      return false;
   }
   
   private ReverseHorizontal(e : TEdge) : void {
      this.Swap(createOutRefParam(() => { return SharpJsHelpers.valueClone(e.Top.X); }, (__value) => { e.Top.X = __value; return SharpJsHelpers.valueClone(__value); }), createOutRefParam(() => { return SharpJsHelpers.valueClone(e.Bot.X); }, (__value) => { e.Bot.X = __value; return SharpJsHelpers.valueClone(__value); }));
   }
   
   public Reset() : void {
      this.m_CurrentLM = this.m_MinimaList;
      if (this.m_CurrentLM === null) return;
      this.m_Scanbeam = null;
      let lm : LocalMinima = this.m_MinimaList;
      while (lm !== null) {
         this.InsertScanbeam(lm.Y);
         let e : TEdge = lm.LeftBound;
         if (e !== null) {
            e.Curr = SharpJsHelpers.valueClone(e.Bot);
            e.OutIdx = SharpJsHelpers.valueClone(ClipperBase.Unassigned);
         }
         e = lm.RightBound;
         if (e !== null) {
            e.Curr = SharpJsHelpers.valueClone(e.Bot);
            e.OutIdx = SharpJsHelpers.valueClone(ClipperBase.Unassigned);
         }
         lm = lm.Next;
      }
      this.m_ActiveEdges = null;
   }
   
   public static GetBounds(paths : Array<Array<IntPoint>>) : IntRect {
      let i : number = 0, cnt : number = paths.length;
      while (i < cnt && paths[i].length === 0) i++;
      if (i === cnt) return new IntRect(0, 0, 0, 0);
      let result : IntRect = new IntRect();
      result.left = SharpJsHelpers.valueClone(paths[i][0].X);
      result.right = SharpJsHelpers.valueClone(result.left);
      result.top = SharpJsHelpers.valueClone(paths[i][0].Y);
      result.bottom = SharpJsHelpers.valueClone(result.top);
      for (; i < cnt; i++) for (let j : number = 0; j < paths[i].length; j++) {
         if (paths[i][j].X < result.left) result.left = SharpJsHelpers.valueClone(paths[i][j].X);
         else if (paths[i][j].X > result.right) result.right = SharpJsHelpers.valueClone(paths[i][j].X);
         if (paths[i][j].Y < result.top) result.top = SharpJsHelpers.valueClone(paths[i][j].Y);
         else if (paths[i][j].Y > result.bottom) result.bottom = SharpJsHelpers.valueClone(paths[i][j].Y);
      }
      return result;
   }
   
   public InsertScanbeam(Y : number) : void {
      if (this.m_Scanbeam === null) {
         this.m_Scanbeam = new Scanbeam();
         this.m_Scanbeam.Next = null;
         this.m_Scanbeam.Y = SharpJsHelpers.valueClone(Y);
      }
      else if (Y > this.m_Scanbeam.Y) {
         let newSb : Scanbeam = new Scanbeam();
         newSb.Y = SharpJsHelpers.valueClone(Y);
         newSb.Next = this.m_Scanbeam;
         this.m_Scanbeam = newSb;
      }
      else {
         let sb2 : Scanbeam = this.m_Scanbeam;
         while (sb2.Next !== null && (Y <= sb2.Next.Y)) sb2 = sb2.Next;
         if (Y === sb2.Y) return;
         let newSb : Scanbeam = new Scanbeam();
         newSb.Y = SharpJsHelpers.valueClone(Y);
         newSb.Next = sb2.Next;
         sb2.Next = newSb;
      }
   }
   
   public PopScanbeam(Y : OutRefParam<number>) : boolean {
      if (this.m_Scanbeam === null) {
         Y.write(SharpJsHelpers.valueClone(0));
         return false;
      }
      Y.write(SharpJsHelpers.valueClone(this.m_Scanbeam.Y));
      this.m_Scanbeam = this.m_Scanbeam.Next;
      return true;
   }
   
   public LocalMinimaPending() : boolean {
      return (this.m_CurrentLM !== null);
   }
   
   public CreateOutRec() : OutRec {
      let result : OutRec = new OutRec();
      result.Idx = SharpJsHelpers.valueClone(ClipperBase.Unassigned);
      result.IsHole = SharpJsHelpers.valueClone(false);
      result.IsOpen = SharpJsHelpers.valueClone(false);
      result.FirstLeft = null;
      result.Pts = null;
      result.BottomPt = null;
      result.PolyNode = null;
      this.m_PolyOuts.push(result);
      result.Idx = SharpJsHelpers.valueClone(this.m_PolyOuts.length - 1);
      return result;
   }
   
   public DisposeOutRec(index : number) : void {
      let outRec : OutRec = this.m_PolyOuts[index];
      outRec.Pts = null;
      outRec = null;
      this.m_PolyOuts[index] = null;
   }
   
   public UpdateEdgeIntoAEL(e : OutRefParam<TEdge>) : void {
      if (e.read().NextInLML === null) throw new ClipperException("UpdateEdgeIntoAEL: invalid call");
      let AelPrev : TEdge = e.read().PrevInAEL;
      let AelNext : TEdge = e.read().NextInAEL;
      e.read().NextInLML.OutIdx = SharpJsHelpers.valueClone(e.read().OutIdx);
      if (AelPrev !== null) AelPrev.NextInAEL = e.read().NextInLML;
      else this.m_ActiveEdges = e.read().NextInLML;
      if (AelNext !== null) AelNext.PrevInAEL = e.read().NextInLML;
      e.read().NextInLML.Side = SharpJsHelpers.valueClone(e.read().Side);
      e.read().NextInLML.WindDelta = SharpJsHelpers.valueClone(e.read().WindDelta);
      e.read().NextInLML.WindCnt = SharpJsHelpers.valueClone(e.read().WindCnt);
      e.read().NextInLML.WindCnt2 = SharpJsHelpers.valueClone(e.read().WindCnt2);
      e.write(e.read().NextInLML);
      e.read().Curr = SharpJsHelpers.valueClone(e.read().Bot);
      e.read().PrevInAEL = AelPrev;
      e.read().NextInAEL = AelNext;
      if (!ClipperBase.IsHorizontal(e.read())) this.InsertScanbeam(e.read().Top.Y);
   }
   
   public SwapPositionsInAEL(edge1 : TEdge, edge2 : TEdge) : void {
      if (edge1.NextInAEL === edge1.PrevInAEL || edge2.NextInAEL === edge2.PrevInAEL) return;
      if (edge1.NextInAEL === edge2) {
         let next : TEdge = edge2.NextInAEL;
         if (next !== null) next.PrevInAEL = edge1;
         let prev : TEdge = edge1.PrevInAEL;
         if (prev !== null) prev.NextInAEL = edge2;
         edge2.PrevInAEL = prev;
         edge2.NextInAEL = edge1;
         edge1.PrevInAEL = edge2;
         edge1.NextInAEL = next;
      }
      else if (edge2.NextInAEL === edge1) {
         let next : TEdge = edge1.NextInAEL;
         if (next !== null) next.PrevInAEL = edge2;
         let prev : TEdge = edge2.PrevInAEL;
         if (prev !== null) prev.NextInAEL = edge1;
         edge1.PrevInAEL = prev;
         edge1.NextInAEL = edge2;
         edge2.PrevInAEL = edge1;
         edge2.NextInAEL = next;
      }
      else {
         let next : TEdge = edge1.NextInAEL;
         let prev : TEdge = edge1.PrevInAEL;
         edge1.NextInAEL = edge2.NextInAEL;
         if (edge1.NextInAEL !== null) edge1.NextInAEL.PrevInAEL = edge1;
         edge1.PrevInAEL = edge2.PrevInAEL;
         if (edge1.PrevInAEL !== null) edge1.PrevInAEL.NextInAEL = edge1;
         edge2.NextInAEL = next;
         if (edge2.NextInAEL !== null) edge2.NextInAEL.PrevInAEL = edge2;
         edge2.PrevInAEL = prev;
         if (edge2.PrevInAEL !== null) edge2.PrevInAEL.NextInAEL = edge2;
      }
      if (edge1.PrevInAEL === null) this.m_ActiveEdges = edge1;
      else if (edge2.PrevInAEL === null) this.m_ActiveEdges = edge2;
   }
   
   public DeleteFromAEL(e : TEdge) : void {
      let AelPrev : TEdge = e.PrevInAEL;
      let AelNext : TEdge = e.NextInAEL;
      if (AelPrev === null && AelNext === null && (e !== this.m_ActiveEdges)) return;
      if (AelPrev !== null) AelPrev.NextInAEL = AelNext;
      else this.m_ActiveEdges = AelNext;
      if (AelNext !== null) AelNext.PrevInAEL = AelPrev;
      e.NextInAEL = null;
      e.PrevInAEL = null;
   }
   
}

export enum NodeType {
   ntAny, 
   ntOpen, 
   ntClosed
}
export class Clipper extends ClipperBase {
   public static readonly ioReverseSolution : number = 1;
   public static readonly ioStrictlySimple : number = 2;
   public static readonly ioPreserveCollinear : number = 4;
   private m_ClipType : ClipType = <ClipType>0;
   private m_Maxima : Maxima = null;
   private m_SortedEdges : TEdge = null;
   private m_IntersectList : Array<IntersectNode> = null;
   m_IntersectNodeComparer : IComparer<IntersectNode> = null;
   private m_ExecuteLocked : boolean = false;
   private m_ClipFillType : PolyFillType = <PolyFillType>0;
   private m_SubjFillType : PolyFillType = <PolyFillType>0;
   private m_Joins : Array<Join> = null;
   private m_GhostJoins : Array<Join> = null;
   private m_UsingPolyTree : boolean = false;
   
   public constructor_SharpJs_Overload_0(InitOptions : number = 0) {
      this.m_Scanbeam = null;
      this.m_Maxima = null;
      this.m_ActiveEdges = null;
      this.m_SortedEdges = null;
      this.m_IntersectList = new Array<IntersectNode>();
      this.m_IntersectNodeComparer = new MyIntersectNodeSort();
      this.m_ExecuteLocked = SharpJsHelpers.valueClone(false);
      this.m_UsingPolyTree = SharpJsHelpers.valueClone(false);
      this.m_PolyOuts = new Array<OutRec>();
      this.m_Joins = new Array<Join>();
      this.m_GhostJoins = new Array<Join>();
      this.ReverseSolution = SharpJsHelpers.valueClone((Clipper.ioReverseSolution & InitOptions) !== 0);
      this.StrictlySimple = SharpJsHelpers.valueClone((Clipper.ioStrictlySimple & InitOptions) !== 0);
      this.PreserveCollinear = SharpJsHelpers.valueClone((Clipper.ioPreserveCollinear & InitOptions) !== 0);
   }
   
   public constructor();
   public constructor(InitOptions : number);
   public constructor(...args: any[]) {
      super();
      if (args.length == 0) { this.constructor_SharpJs_Overload_0(<number>0); return; }
      else if (args.length == 1 && SharpJsHelpers.TestTypeCheck(args[0], 'number')) { this.constructor_SharpJs_Overload_0(<number>args[0]); return; }
      throw new Error('SharpJS: Failed to match method overload. This can be due to differences in C#/JS type system.');
   }
   
   private m_ReverseSolution : boolean = false;
   get ReverseSolution(): boolean { return this.m_ReverseSolution; }
   set ReverseSolution(value: boolean) { this.m_ReverseSolution = SharpJsHelpers.valueClone(value); }
   private m_StrictlySimple : boolean = false;
   get StrictlySimple(): boolean { return this.m_StrictlySimple; }
   set StrictlySimple(value: boolean) { this.m_StrictlySimple = SharpJsHelpers.valueClone(value); }
   private InsertMaxima(X : number) : void {
      let newMax : Maxima = new Maxima();
      newMax.X = SharpJsHelpers.valueClone(X);
      if (this.m_Maxima === null) {
         this.m_Maxima = newMax;
         this.m_Maxima.Next = null;
         this.m_Maxima.Prev = null;
      }
      else if (X < this.m_Maxima.X) {
         newMax.Next = this.m_Maxima;
         newMax.Prev = null;
         this.m_Maxima = newMax;
      }
      else {
         let m : Maxima = this.m_Maxima;
         while (m.Next !== null && (X >= m.Next.X)) m = m.Next;
         if (X === m.X) return;
         newMax.Next = m.Next;
         newMax.Prev = m;
         if (m.Next !== null) m.Next.Prev = newMax;
         m.Next = newMax;
      }
   }
   
   public Execute_SharpJs_Overload_0(clipType : ClipType, solution : Array<Array<IntPoint>>, FillType : PolyFillType = PolyFillType.pftEvenOdd) : boolean {
      return this.Execute(clipType, solution, FillType, FillType);
   }
   
   public Execute_SharpJs_Overload_1(clipType : ClipType, polytree : PolyTree, FillType : PolyFillType = PolyFillType.pftEvenOdd) : boolean {
      return this.Execute(clipType, polytree, FillType, FillType);
   }
   
   public Execute_SharpJs_Overload_2(clipType : ClipType, solution : Array<Array<IntPoint>>, subjFillType : PolyFillType, clipFillType : PolyFillType) : boolean {
      if (this.m_ExecuteLocked) return false;
      if (this.m_HasOpenPaths) throw new ClipperException("Error: PolyTree struct is needed for open path clipping.");
      this.m_ExecuteLocked = SharpJsHelpers.valueClone(true);
      SharpJsHelpers.arrayClear(solution);
      this.m_SubjFillType = SharpJsHelpers.valueClone(subjFillType);
      this.m_ClipFillType = SharpJsHelpers.valueClone(clipFillType);
      this.m_ClipType = SharpJsHelpers.valueClone(clipType);
      this.m_UsingPolyTree = SharpJsHelpers.valueClone(false);
      let succeeded : boolean = false;
      try {
         succeeded = SharpJsHelpers.valueClone(this.ExecuteInternal());
         if (succeeded) this.BuildResult(solution);
      }
       finally {
         this.DisposeAllPolyPts();
         this.m_ExecuteLocked = SharpJsHelpers.valueClone(false);
      }
      
      return succeeded;
   }
   
   public Execute_SharpJs_Overload_3(clipType : ClipType, polytree : PolyTree, subjFillType : PolyFillType, clipFillType : PolyFillType) : boolean {
      if (this.m_ExecuteLocked) return false;
      this.m_ExecuteLocked = SharpJsHelpers.valueClone(true);
      this.m_SubjFillType = SharpJsHelpers.valueClone(subjFillType);
      this.m_ClipFillType = SharpJsHelpers.valueClone(clipFillType);
      this.m_ClipType = SharpJsHelpers.valueClone(clipType);
      this.m_UsingPolyTree = SharpJsHelpers.valueClone(true);
      let succeeded : boolean = false;
      try {
         succeeded = SharpJsHelpers.valueClone(this.ExecuteInternal());
         if (succeeded) this.BuildResult2(polytree);
      }
       finally {
         this.DisposeAllPolyPts();
         this.m_ExecuteLocked = SharpJsHelpers.valueClone(false);
      }
      
      return succeeded;
   }
   
   public Execute(clipType : ClipType, solution : Array<Array<IntPoint>>) : boolean;
   public Execute(clipType : ClipType, solution : Array<Array<IntPoint>>, FillType : PolyFillType) : boolean;
   public Execute(clipType : ClipType, polytree : PolyTree) : boolean;
   public Execute(clipType : ClipType, polytree : PolyTree, FillType : PolyFillType) : boolean;
   public Execute(clipType : ClipType, solution : Array<Array<IntPoint>>, subjFillType : PolyFillType, clipFillType : PolyFillType) : boolean;
   public Execute(clipType : ClipType, polytree : PolyTree, subjFillType : PolyFillType, clipFillType : PolyFillType) : boolean;
   public Execute(...args: any[]): boolean | boolean | boolean | boolean {
      if (args.length == 2 && SharpJsHelpers.TestTypeCheck(args[0], 'number') && SharpJsHelpers.TestTypeCheck(args[1], Array)) return this.Execute_SharpJs_Overload_0(<ClipType>args[0], <Array<Array<IntPoint>>>args[1], <PolyFillType>PolyFillType.pftEvenOdd);
      else if (args.length == 3 && SharpJsHelpers.TestTypeCheck(args[0], 'number') && SharpJsHelpers.TestTypeCheck(args[1], Array) && SharpJsHelpers.TestTypeCheck(args[2], 'number')) return this.Execute_SharpJs_Overload_0(<ClipType>args[0], <Array<Array<IntPoint>>>args[1], <PolyFillType>args[2]);
      else if (args.length == 2 && SharpJsHelpers.TestTypeCheck(args[0], 'number') && SharpJsHelpers.TestTypeCheck(args[1], PolyTree)) return this.Execute_SharpJs_Overload_1(<ClipType>args[0], <PolyTree>args[1], <PolyFillType>PolyFillType.pftEvenOdd);
      else if (args.length == 3 && SharpJsHelpers.TestTypeCheck(args[0], 'number') && SharpJsHelpers.TestTypeCheck(args[1], PolyTree) && SharpJsHelpers.TestTypeCheck(args[2], 'number')) return this.Execute_SharpJs_Overload_1(<ClipType>args[0], <PolyTree>args[1], <PolyFillType>args[2]);
      else if (args.length == 4 && SharpJsHelpers.TestTypeCheck(args[0], 'number') && SharpJsHelpers.TestTypeCheck(args[1], Array) && SharpJsHelpers.TestTypeCheck(args[2], 'number') && SharpJsHelpers.TestTypeCheck(args[3], 'number')) return this.Execute_SharpJs_Overload_2(<ClipType>args[0], <Array<Array<IntPoint>>>args[1], <PolyFillType>args[2], <PolyFillType>args[3]);
      else if (args.length == 4 && SharpJsHelpers.TestTypeCheck(args[0], 'number') && SharpJsHelpers.TestTypeCheck(args[1], PolyTree) && SharpJsHelpers.TestTypeCheck(args[2], 'number') && SharpJsHelpers.TestTypeCheck(args[3], 'number')) return this.Execute_SharpJs_Overload_3(<ClipType>args[0], <PolyTree>args[1], <PolyFillType>args[2], <PolyFillType>args[3]);
      throw new Error('SharpJS: Failed to match method overload. This can be due to differences in C#/JS type system.');
   }
   
   public FixHoleLinkage(outRec : OutRec) : void {
      if (outRec.FirstLeft === null || (outRec.IsHole !== outRec.FirstLeft.IsHole && outRec.FirstLeft.Pts !== null)) return;
      let orfl : OutRec = outRec.FirstLeft;
      while (orfl !== null && ((orfl.IsHole === outRec.IsHole) || orfl.Pts === null)) orfl = orfl.FirstLeft;
      outRec.FirstLeft = orfl;
   }
   
   private ExecuteInternal() : boolean {
      try {
         this.Reset();
         this.m_SortedEdges = null;
         this.m_Maxima = null;
         let botY : number = 0, topY : number = 0;
         if (!this.PopScanbeam(createOutRefParam(() => { return SharpJsHelpers.valueClone(botY); }, (__value) => { botY = __value; return SharpJsHelpers.valueClone(__value); }))) return false;
         this.InsertLocalMinimaIntoAEL(botY);
         while (this.PopScanbeam(createOutRefParam(() => { return SharpJsHelpers.valueClone(topY); }, (__value) => { topY = __value; return SharpJsHelpers.valueClone(__value); })) || this.LocalMinimaPending()) {
            this.ProcessHorizontals();
            SharpJsHelpers.arrayClear(this.m_GhostJoins);
            if (!this.ProcessIntersections(topY)) return false;
            this.ProcessEdgesAtTopOfScanbeam(topY);
            botY = SharpJsHelpers.valueClone(topY);
            this.InsertLocalMinimaIntoAEL(botY);
         }
         for (let outRec of this.m_PolyOuts) {
            if (outRec.Pts === null || outRec.IsOpen) continue;
            if ((SharpJsHelpers.booleanXor(outRec.IsHole, this.ReverseSolution)) === (this.Area(outRec) > 0)) this.ReversePolyPtLinks(outRec.Pts);
         }
         this.JoinCommonEdges();
         for (let outRec of this.m_PolyOuts) {
            if (outRec.Pts === null) continue;
            else if (outRec.IsOpen) this.FixupOutPolyline(outRec);
            else this.FixupOutPolygon(outRec);
         }
         if (this.StrictlySimple) this.DoSimplePolygons();
         return true;
      }
       finally {
         SharpJsHelpers.arrayClear(this.m_Joins);
         SharpJsHelpers.arrayClear(this.m_GhostJoins);
      }
      
   }
   
   private DisposeAllPolyPts() : void {
      for (let i : number = 0; i < this.m_PolyOuts.length; ++i) this.DisposeOutRec(i);
      SharpJsHelpers.arrayClear(this.m_PolyOuts);
   }
   
   private AddJoin(Op1 : OutPt, Op2 : OutPt, OffPt : IntPoint) : void {
      let j : Join = new Join();
      j.OutPt1 = Op1;
      j.OutPt2 = Op2;
      j.OffPt = SharpJsHelpers.valueClone(OffPt);
      this.m_Joins.push(j);
   }
   
   private AddGhostJoin(Op : OutPt, OffPt : IntPoint) : void {
      let j : Join = new Join();
      j.OutPt1 = Op;
      j.OffPt = SharpJsHelpers.valueClone(OffPt);
      this.m_GhostJoins.push(j);
   }
   
   private InsertLocalMinimaIntoAEL(botY : number) : void {
      let lm : LocalMinima = null;
      while (this.PopLocalMinima(botY, createOutRefParam(() => { return SharpJsHelpers.valueClone(lm); }, (__value) => { lm = __value; return SharpJsHelpers.valueClone(__value); }))) {
         let lb : TEdge = lm.LeftBound;
         let rb : TEdge = lm.RightBound;
         let Op1 : OutPt = null;
         if (lb === null) {
            this.InsertEdgeIntoAEL(rb, null);
            this.SetWindingCount(rb);
            if (this.IsContributing(rb)) Op1 = this.AddOutPt(rb, rb.Bot);
         }
         else if (rb === null) {
            this.InsertEdgeIntoAEL(lb, null);
            this.SetWindingCount(lb);
            if (this.IsContributing(lb)) Op1 = this.AddOutPt(lb, lb.Bot);
            this.InsertScanbeam(lb.Top.Y);
         }
         else {
            this.InsertEdgeIntoAEL(lb, null);
            this.InsertEdgeIntoAEL(rb, lb);
            this.SetWindingCount(lb);
            rb.WindCnt = SharpJsHelpers.valueClone(lb.WindCnt);
            rb.WindCnt2 = SharpJsHelpers.valueClone(lb.WindCnt2);
            if (this.IsContributing(lb)) Op1 = this.AddLocalMinPoly(lb, rb, lb.Bot);
            this.InsertScanbeam(lb.Top.Y);
         }
         if (rb !== null) {
            if (ClipperBase.IsHorizontal(rb)) {
               if (rb.NextInLML !== null) this.InsertScanbeam(rb.NextInLML.Top.Y);
               this.AddEdgeToSEL(rb);
            }
            else this.InsertScanbeam(rb.Top.Y);
         }
         if (lb === null || rb === null) continue;
         if (Op1 !== null && ClipperBase.IsHorizontal(rb) && this.m_GhostJoins.length > 0 && rb.WindDelta !== 0) {
            for (let i : number = 0; i < this.m_GhostJoins.length; i++) {
               let j : Join = this.m_GhostJoins[i];
               if (this.HorzSegmentsOverlap(j.OutPt1.Pt.X, j.OffPt.X, rb.Bot.X, rb.Top.X)) this.AddJoin(j.OutPt1, Op1, j.OffPt);
            }
         }
         if (lb.OutIdx >= 0 && lb.PrevInAEL !== null && lb.PrevInAEL.Curr.X === lb.Bot.X && lb.PrevInAEL.OutIdx >= 0 && ClipperBase.SlopesEqual(lb.PrevInAEL.Curr, lb.PrevInAEL.Top, lb.Curr, lb.Top, this.m_UseFullRange) && lb.WindDelta !== 0 && lb.PrevInAEL.WindDelta !== 0) {
            let Op2 : OutPt = this.AddOutPt(lb.PrevInAEL, lb.Bot);
            this.AddJoin(Op1, Op2, lb.Top);
         }
         if (lb.NextInAEL !== rb) {
            if (rb.OutIdx >= 0 && rb.PrevInAEL.OutIdx >= 0 && ClipperBase.SlopesEqual(rb.PrevInAEL.Curr, rb.PrevInAEL.Top, rb.Curr, rb.Top, this.m_UseFullRange) && rb.WindDelta !== 0 && rb.PrevInAEL.WindDelta !== 0) {
               let Op2 : OutPt = this.AddOutPt(rb.PrevInAEL, rb.Bot);
               this.AddJoin(Op1, Op2, rb.Top);
            }
            let e : TEdge = lb.NextInAEL;
            if (e !== null) while (e !== rb) {
               this.IntersectEdges(rb, e, lb.Curr);
               e = e.NextInAEL;
            }
         }
      }
   }
   
   private InsertEdgeIntoAEL(edge : TEdge, startEdge : TEdge) : void {
      if (this.m_ActiveEdges === null) {
         edge.PrevInAEL = null;
         edge.NextInAEL = null;
         this.m_ActiveEdges = edge;
      }
      else if (startEdge === null && this.E2InsertsBeforeE1(this.m_ActiveEdges, edge)) {
         edge.PrevInAEL = null;
         edge.NextInAEL = this.m_ActiveEdges;
         this.m_ActiveEdges.PrevInAEL = edge;
         this.m_ActiveEdges = edge;
      }
      else {
         if (startEdge === null) startEdge = this.m_ActiveEdges;
         while (startEdge.NextInAEL !== null && !this.E2InsertsBeforeE1(startEdge.NextInAEL, edge)) startEdge = startEdge.NextInAEL;
         edge.NextInAEL = startEdge.NextInAEL;
         if (startEdge.NextInAEL !== null) startEdge.NextInAEL.PrevInAEL = edge;
         edge.PrevInAEL = startEdge;
         startEdge.NextInAEL = edge;
      }
   }
   
   private E2InsertsBeforeE1(e1 : TEdge, e2 : TEdge) : boolean {
      if (e2.Curr.X === e1.Curr.X) {
         if (e2.Top.Y > e1.Top.Y) return e2.Top.X < Clipper.TopX(e1, e2.Top.Y);
         else return e1.Top.X > Clipper.TopX(e2, e1.Top.Y);
      }
      else return e2.Curr.X < e1.Curr.X;
   }
   
   private IsEvenOddFillType(edge : TEdge) : boolean {
      if (edge.PolyTyp === PolyType.ptSubject) return this.m_SubjFillType === PolyFillType.pftEvenOdd;
      else return this.m_ClipFillType === PolyFillType.pftEvenOdd;
   }
   
   private IsEvenOddAltFillType(edge : TEdge) : boolean {
      if (edge.PolyTyp === PolyType.ptSubject) return this.m_ClipFillType === PolyFillType.pftEvenOdd;
      else return this.m_SubjFillType === PolyFillType.pftEvenOdd;
   }
   
   private IsContributing(edge : TEdge) : boolean {
      let pft : PolyFillType = <PolyFillType>0, pft2 : PolyFillType = <PolyFillType>0;
      if (edge.PolyTyp === PolyType.ptSubject) {
         pft = SharpJsHelpers.valueClone(this.m_SubjFillType);
         pft2 = SharpJsHelpers.valueClone(this.m_ClipFillType);
      }
      else {
         pft = SharpJsHelpers.valueClone(this.m_ClipFillType);
         pft2 = SharpJsHelpers.valueClone(this.m_SubjFillType);
      }
      switch (pft) {
         case PolyFillType.pftEvenOdd: {
            if (edge.WindDelta === 0 && edge.WindCnt !== 1) return false;
            break;
         }
         case PolyFillType.pftNonZero: {
            if (Math.abs(edge.WindCnt) !== 1) return false;
            break;
         }
         case PolyFillType.pftPositive: {
            if (edge.WindCnt !== 1) return false;
            break;
         }
         default: {
            if (edge.WindCnt !== -1) return false;
            break;
         }
      }
      switch (this.m_ClipType) {
         case ClipType.ctIntersection: {
            switch (pft2) {
               case PolyFillType.pftEvenOdd: 
               case PolyFillType.pftNonZero: {
                  return (edge.WindCnt2 !== 0);
               }
               case PolyFillType.pftPositive: {
                  return (edge.WindCnt2 > 0);
               }
               default: {
                  return (edge.WindCnt2 < 0);
               }
            }
         }
         case ClipType.ctUnion: {
            switch (pft2) {
               case PolyFillType.pftEvenOdd: 
               case PolyFillType.pftNonZero: {
                  return (edge.WindCnt2 === 0);
               }
               case PolyFillType.pftPositive: {
                  return (edge.WindCnt2 <= 0);
               }
               default: {
                  return (edge.WindCnt2 >= 0);
               }
            }
         }
         case ClipType.ctDifference: {
            if (edge.PolyTyp === PolyType.ptSubject) switch (pft2) {
               case PolyFillType.pftEvenOdd: 
               case PolyFillType.pftNonZero: {
                  return (edge.WindCnt2 === 0);
               }
               case PolyFillType.pftPositive: {
                  return (edge.WindCnt2 <= 0);
               }
               default: {
                  return (edge.WindCnt2 >= 0);
               }
            }
            else switch (pft2) {
               case PolyFillType.pftEvenOdd: 
               case PolyFillType.pftNonZero: {
                  return (edge.WindCnt2 !== 0);
               }
               case PolyFillType.pftPositive: {
                  return (edge.WindCnt2 > 0);
               }
               default: {
                  return (edge.WindCnt2 < 0);
               }
            }
         }
         case ClipType.ctXor: {
            if (edge.WindDelta === 0) switch (pft2) {
               case PolyFillType.pftEvenOdd: 
               case PolyFillType.pftNonZero: {
                  return (edge.WindCnt2 === 0);
               }
               case PolyFillType.pftPositive: {
                  return (edge.WindCnt2 <= 0);
               }
               default: {
                  return (edge.WindCnt2 >= 0);
               }
            }
            else return true;
         }
      }
      return true;
   }
   
   private SetWindingCount(edge : TEdge) : void {
      let e : TEdge = edge.PrevInAEL;
      while (e !== null && ((e.PolyTyp !== edge.PolyTyp) || (e.WindDelta === 0))) e = e.PrevInAEL;
      if (e === null) {
         let pft : PolyFillType = <PolyFillType>0;
         pft = SharpJsHelpers.valueClone((edge.PolyTyp === PolyType.ptSubject ? this.m_SubjFillType : this.m_ClipFillType));
         if (edge.WindDelta === 0) edge.WindCnt = SharpJsHelpers.valueClone((pft === PolyFillType.pftNegative ? -1 : 1));
         else edge.WindCnt = SharpJsHelpers.valueClone(edge.WindDelta);
         edge.WindCnt2 = SharpJsHelpers.valueClone(0);
         e = this.m_ActiveEdges;
      }
      else if (edge.WindDelta === 0 && this.m_ClipType !== ClipType.ctUnion) {
         edge.WindCnt = SharpJsHelpers.valueClone(1);
         edge.WindCnt2 = SharpJsHelpers.valueClone(e.WindCnt2);
         e = e.NextInAEL;
      }
      else if (this.IsEvenOddFillType(edge)) {
         if (edge.WindDelta === 0) {
            let Inside : boolean = true;
            let e2 : TEdge = e.PrevInAEL;
            while (e2 !== null) {
               if (e2.PolyTyp === e.PolyTyp && e2.WindDelta !== 0) Inside = SharpJsHelpers.valueClone(!Inside);
               e2 = e2.PrevInAEL;
            }
            edge.WindCnt = SharpJsHelpers.valueClone((Inside ? 0 : 1));
         }
         else {
            edge.WindCnt = SharpJsHelpers.valueClone(edge.WindDelta);
         }
         edge.WindCnt2 = SharpJsHelpers.valueClone(e.WindCnt2);
         e = e.NextInAEL;
      }
      else {
         if (e.WindCnt * e.WindDelta < 0) {
            if (Math.abs(e.WindCnt) > 1) {
               if (e.WindDelta * edge.WindDelta < 0) edge.WindCnt = SharpJsHelpers.valueClone(e.WindCnt);
               else edge.WindCnt = SharpJsHelpers.valueClone(e.WindCnt + edge.WindDelta);
            }
            else edge.WindCnt = SharpJsHelpers.valueClone((edge.WindDelta === 0 ? 1 : edge.WindDelta));
         }
         else {
            if (edge.WindDelta === 0) edge.WindCnt = SharpJsHelpers.valueClone((e.WindCnt < 0 ? e.WindCnt - 1 : e.WindCnt + 1));
            else if (e.WindDelta * edge.WindDelta < 0) edge.WindCnt = SharpJsHelpers.valueClone(e.WindCnt);
            else edge.WindCnt = SharpJsHelpers.valueClone(e.WindCnt + edge.WindDelta);
         }
         edge.WindCnt2 = SharpJsHelpers.valueClone(e.WindCnt2);
         e = e.NextInAEL;
      }
      if (this.IsEvenOddAltFillType(edge)) {
         while (e !== edge) {
            if (e.WindDelta !== 0) edge.WindCnt2 = SharpJsHelpers.valueClone((edge.WindCnt2 === 0 ? 1 : 0));
            e = e.NextInAEL;
         }
      }
      else {
         while (e !== edge) {
            edge.WindCnt2 += SharpJsHelpers.valueClone(e.WindDelta);
            e = e.NextInAEL;
         }
      }
   }
   
   private AddEdgeToSEL(edge : TEdge) : void {
      if (this.m_SortedEdges === null) {
         this.m_SortedEdges = edge;
         edge.PrevInSEL = null;
         edge.NextInSEL = null;
      }
      else {
         edge.NextInSEL = this.m_SortedEdges;
         edge.PrevInSEL = null;
         this.m_SortedEdges.PrevInSEL = edge;
         this.m_SortedEdges = edge;
      }
   }
   
   public PopEdgeFromSEL(e : OutRefParam<TEdge>) : boolean {
      e.write(this.m_SortedEdges);
      if (e.read() === null) return false;
      let oldE : TEdge = e.read();
      this.m_SortedEdges = e.read().NextInSEL;
      if (this.m_SortedEdges !== null) this.m_SortedEdges.PrevInSEL = null;
      oldE.NextInSEL = null;
      oldE.PrevInSEL = null;
      return true;
   }
   
   private CopyAELToSEL() : void {
      let e : TEdge = this.m_ActiveEdges;
      this.m_SortedEdges = e;
      while (e !== null) {
         e.PrevInSEL = e.PrevInAEL;
         e.NextInSEL = e.NextInAEL;
         e = e.NextInAEL;
      }
   }
   
   private SwapPositionsInSEL(edge1 : TEdge, edge2 : TEdge) : void {
      if (edge1.NextInSEL === null && edge1.PrevInSEL === null) return;
      if (edge2.NextInSEL === null && edge2.PrevInSEL === null) return;
      if (edge1.NextInSEL === edge2) {
         let next : TEdge = edge2.NextInSEL;
         if (next !== null) next.PrevInSEL = edge1;
         let prev : TEdge = edge1.PrevInSEL;
         if (prev !== null) prev.NextInSEL = edge2;
         edge2.PrevInSEL = prev;
         edge2.NextInSEL = edge1;
         edge1.PrevInSEL = edge2;
         edge1.NextInSEL = next;
      }
      else if (edge2.NextInSEL === edge1) {
         let next : TEdge = edge1.NextInSEL;
         if (next !== null) next.PrevInSEL = edge2;
         let prev : TEdge = edge2.PrevInSEL;
         if (prev !== null) prev.NextInSEL = edge1;
         edge1.PrevInSEL = prev;
         edge1.NextInSEL = edge2;
         edge2.PrevInSEL = edge1;
         edge2.NextInSEL = next;
      }
      else {
         let next : TEdge = edge1.NextInSEL;
         let prev : TEdge = edge1.PrevInSEL;
         edge1.NextInSEL = edge2.NextInSEL;
         if (edge1.NextInSEL !== null) edge1.NextInSEL.PrevInSEL = edge1;
         edge1.PrevInSEL = edge2.PrevInSEL;
         if (edge1.PrevInSEL !== null) edge1.PrevInSEL.NextInSEL = edge1;
         edge2.NextInSEL = next;
         if (edge2.NextInSEL !== null) edge2.NextInSEL.PrevInSEL = edge2;
         edge2.PrevInSEL = prev;
         if (edge2.PrevInSEL !== null) edge2.PrevInSEL.NextInSEL = edge2;
      }
      if (edge1.PrevInSEL === null) this.m_SortedEdges = edge1;
      else if (edge2.PrevInSEL === null) this.m_SortedEdges = edge2;
   }
   
   private AddLocalMaxPoly(e1 : TEdge, e2 : TEdge, pt : IntPoint) : void {
      this.AddOutPt(e1, pt);
      if (e2.WindDelta === 0) this.AddOutPt(e2, pt);
      if (e1.OutIdx === e2.OutIdx) {
         e1.OutIdx = SharpJsHelpers.valueClone(ClipperBase.Unassigned);
         e2.OutIdx = SharpJsHelpers.valueClone(ClipperBase.Unassigned);
      }
      else if (e1.OutIdx < e2.OutIdx) this.AppendPolygon(e1, e2);
      else this.AppendPolygon(e2, e1);
   }
   
   private AddLocalMinPoly(e1 : TEdge, e2 : TEdge, pt : IntPoint) : OutPt {
      let result : OutPt = null;
      let e : TEdge = null, prevE : TEdge = null;
      if (ClipperBase.IsHorizontal(e2) || (e1.Dx > e2.Dx)) {
         result = this.AddOutPt(e1, pt);
         e2.OutIdx = SharpJsHelpers.valueClone(e1.OutIdx);
         e1.Side = SharpJsHelpers.valueClone(EdgeSide.esLeft);
         e2.Side = SharpJsHelpers.valueClone(EdgeSide.esRight);
         e = e1;
         if (e.PrevInAEL === e2) prevE = e2.PrevInAEL;
         else prevE = e.PrevInAEL;
      }
      else {
         result = this.AddOutPt(e2, pt);
         e1.OutIdx = SharpJsHelpers.valueClone(e2.OutIdx);
         e1.Side = SharpJsHelpers.valueClone(EdgeSide.esRight);
         e2.Side = SharpJsHelpers.valueClone(EdgeSide.esLeft);
         e = e2;
         if (e.PrevInAEL === e1) prevE = e1.PrevInAEL;
         else prevE = e.PrevInAEL;
      }
      if (prevE !== null && prevE.OutIdx >= 0 && prevE.Top.Y < pt.Y && e.Top.Y < pt.Y) {
         let xPrev : number = Clipper.TopX(prevE, pt.Y);
         let xE : number = Clipper.TopX(e, pt.Y);
         if ((xPrev === xE) && (e.WindDelta !== 0) && (prevE.WindDelta !== 0) && ClipperBase.SlopesEqual(new IntPoint(xPrev, pt.Y), prevE.Top, new IntPoint(xE, pt.Y), e.Top, this.m_UseFullRange)) {
            let outPt : OutPt = this.AddOutPt(prevE, pt);
            this.AddJoin(result, outPt, e.Top);
         }
      }
      return result;
   }
   
   private AddOutPt(e : TEdge, pt : IntPoint) : OutPt {
      if (e.OutIdx < 0) {
         let outRec : OutRec = this.CreateOutRec();
         outRec.IsOpen = SharpJsHelpers.valueClone((e.WindDelta === 0));
         let newOp : OutPt = new OutPt();
         outRec.Pts = newOp;
         newOp.Idx = SharpJsHelpers.valueClone(outRec.Idx);
         newOp.Pt = SharpJsHelpers.valueClone(pt);
         newOp.Next = newOp;
         newOp.Prev = newOp;
         if (!outRec.IsOpen) this.SetHoleState(e, outRec);
         e.OutIdx = SharpJsHelpers.valueClone(outRec.Idx);
         return newOp;
      }
      else {
         let outRec : OutRec = this.m_PolyOuts[e.OutIdx];
         let op : OutPt = outRec.Pts;
         let ToFront : boolean = (e.Side === EdgeSide.esLeft);
         if (ToFront && SharpJsHelpers.tryBinaryOperator(pt, op.Pt, 'opEquals', (a, b) => a == b)) return op;
         else if (!ToFront && SharpJsHelpers.tryBinaryOperator(pt, op.Prev.Pt, 'opEquals', (a, b) => a == b)) return op.Prev;
         let newOp : OutPt = new OutPt();
         newOp.Idx = SharpJsHelpers.valueClone(outRec.Idx);
         newOp.Pt = SharpJsHelpers.valueClone(pt);
         newOp.Next = op;
         newOp.Prev = op.Prev;
         newOp.Prev.Next = newOp;
         op.Prev = newOp;
         if (ToFront) outRec.Pts = newOp;
         return newOp;
      }
   }
   
   private GetLastOutPt(e : TEdge) : OutPt {
      let outRec : OutRec = this.m_PolyOuts[e.OutIdx];
      if (e.Side === EdgeSide.esLeft) return outRec.Pts;
      else return outRec.Pts.Prev;
   }
   
   public SwapPoints(pt1 : OutRefParam<IntPoint>, pt2 : OutRefParam<IntPoint>) : void {
      let tmp : IntPoint = pt1.read();
      pt1.write(SharpJsHelpers.valueClone(pt2.read()));
      pt2.write(SharpJsHelpers.valueClone(tmp));
   }
   
   private HorzSegmentsOverlap(seg1a : number, seg1b : number, seg2a : number, seg2b : number) : boolean {
      if (seg1a > seg1b) this.Swap(createOutRefParam(() => { return SharpJsHelpers.valueClone(seg1a); }, (__value) => { seg1a = __value; return SharpJsHelpers.valueClone(__value); }), createOutRefParam(() => { return SharpJsHelpers.valueClone(seg1b); }, (__value) => { seg1b = __value; return SharpJsHelpers.valueClone(__value); }));
      if (seg2a > seg2b) this.Swap(createOutRefParam(() => { return SharpJsHelpers.valueClone(seg2a); }, (__value) => { seg2a = __value; return SharpJsHelpers.valueClone(__value); }), createOutRefParam(() => { return SharpJsHelpers.valueClone(seg2b); }, (__value) => { seg2b = __value; return SharpJsHelpers.valueClone(__value); }));
      return (seg1a < seg2b) && (seg2a < seg1b);
   }
   
   private SetHoleState(e : TEdge, outRec : OutRec) : void {
      let e2 : TEdge = e.PrevInAEL;
      let eTmp : TEdge = null;
      while (e2 !== null) {
         if (e2.OutIdx >= 0 && e2.WindDelta !== 0) {
            if (eTmp === null) eTmp = e2;
            else if (eTmp.OutIdx === e2.OutIdx) eTmp = null;
         }
         e2 = e2.PrevInAEL;
      }
      if (eTmp === null) {
         outRec.FirstLeft = null;
         outRec.IsHole = SharpJsHelpers.valueClone(false);
      }
      else {
         outRec.FirstLeft = this.m_PolyOuts[eTmp.OutIdx];
         outRec.IsHole = SharpJsHelpers.valueClone(!outRec.FirstLeft.IsHole);
      }
   }
   
   private GetDx(pt1 : IntPoint, pt2 : IntPoint) : number {
      if (pt1.Y === pt2.Y) return ClipperBase.horizontal;
      else return <number>(pt2.X - pt1.X) / (pt2.Y - pt1.Y);
   }
   
   private FirstIsBottomPt(btmPt1 : OutPt, btmPt2 : OutPt) : boolean {
      let p : OutPt = btmPt1.Prev;
      while ((SharpJsHelpers.tryBinaryOperator(p.Pt, btmPt1.Pt, 'opEquals', (a, b) => a == b)) && (p !== btmPt1)) p = p.Prev;
      let dx1p : number = Math.abs(this.GetDx(btmPt1.Pt, p.Pt));
      p = btmPt1.Next;
      while ((SharpJsHelpers.tryBinaryOperator(p.Pt, btmPt1.Pt, 'opEquals', (a, b) => a == b)) && (p !== btmPt1)) p = p.Next;
      let dx1n : number = Math.abs(this.GetDx(btmPt1.Pt, p.Pt));
      p = btmPt2.Prev;
      while ((SharpJsHelpers.tryBinaryOperator(p.Pt, btmPt2.Pt, 'opEquals', (a, b) => a == b)) && (p !== btmPt2)) p = p.Prev;
      let dx2p : number = Math.abs(this.GetDx(btmPt2.Pt, p.Pt));
      p = btmPt2.Next;
      while ((SharpJsHelpers.tryBinaryOperator(p.Pt, btmPt2.Pt, 'opEquals', (a, b) => a == b)) && (p !== btmPt2)) p = p.Next;
      let dx2n : number = Math.abs(this.GetDx(btmPt2.Pt, p.Pt));
      if (Math.max(dx1p, dx1n) === Math.max(dx2p, dx2n) && Math.min(dx1p, dx1n) === Math.min(dx2p, dx2n)) return this.Area(btmPt1) > 0;
      else return (dx1p >= dx2p && dx1p >= dx2n) || (dx1n >= dx2p && dx1n >= dx2n);
   }
   
   private GetBottomPt(pp : OutPt) : OutPt {
      let dups : OutPt = null;
      let p : OutPt = pp.Next;
      while (p !== pp) {
         if (p.Pt.Y > pp.Pt.Y) {
            pp = p;
            dups = null;
         }
         else if (p.Pt.Y === pp.Pt.Y && p.Pt.X <= pp.Pt.X) {
            if (p.Pt.X < pp.Pt.X) {
               dups = null;
               pp = p;
            }
            else {
               if (p.Next !== pp && p.Prev !== pp) dups = p;
            }
         }
         p = p.Next;
      }
      if (dups !== null) {
         while (dups !== p) {
            if (!this.FirstIsBottomPt(p, dups)) pp = dups;
            dups = dups.Next;
            while (SharpJsHelpers.tryBinaryOperator(dups.Pt, pp.Pt, 'opNotEquals', (a, b) => a != b)) dups = dups.Next;
         }
      }
      return pp;
   }
   
   private GetLowermostRec(outRec1 : OutRec, outRec2 : OutRec) : OutRec {
      if (outRec1.BottomPt === null) outRec1.BottomPt = this.GetBottomPt(outRec1.Pts);
      if (outRec2.BottomPt === null) outRec2.BottomPt = this.GetBottomPt(outRec2.Pts);
      let bPt1 : OutPt = outRec1.BottomPt;
      let bPt2 : OutPt = outRec2.BottomPt;
      if (bPt1.Pt.Y > bPt2.Pt.Y) return outRec1;
      else if (bPt1.Pt.Y < bPt2.Pt.Y) return outRec2;
      else if (bPt1.Pt.X < bPt2.Pt.X) return outRec1;
      else if (bPt1.Pt.X > bPt2.Pt.X) return outRec2;
      else if (bPt1.Next === bPt1) return outRec2;
      else if (bPt2.Next === bPt2) return outRec1;
      else if (this.FirstIsBottomPt(bPt1, bPt2)) return outRec1;
      else return outRec2;
   }
   
   OutRec1RightOfOutRec2(outRec1 : OutRec, outRec2 : OutRec) : boolean {
      do {{
         outRec1 = outRec1.FirstLeft;
         if (outRec1 === outRec2) return true;
      }
      } while(outRec1 !== null);return false;
   }
   
   private GetOutRec(idx : number) : OutRec {
      let outrec : OutRec = this.m_PolyOuts[idx];
      while (outrec !== this.m_PolyOuts[outrec.Idx]) outrec = this.m_PolyOuts[outrec.Idx];
      return outrec;
   }
   
   private AppendPolygon(e1 : TEdge, e2 : TEdge) : void {
      let outRec1 : OutRec = this.m_PolyOuts[e1.OutIdx];
      let outRec2 : OutRec = this.m_PolyOuts[e2.OutIdx];
      let holeStateRec : OutRec = null;
      if (this.OutRec1RightOfOutRec2(outRec1, outRec2)) holeStateRec = outRec2;
      else if (this.OutRec1RightOfOutRec2(outRec2, outRec1)) holeStateRec = outRec1;
      else holeStateRec = this.GetLowermostRec(outRec1, outRec2);
      let p1_lft : OutPt = outRec1.Pts;
      let p1_rt : OutPt = p1_lft.Prev;
      let p2_lft : OutPt = outRec2.Pts;
      let p2_rt : OutPt = p2_lft.Prev;
      if (e1.Side === EdgeSide.esLeft) {
         if (e2.Side === EdgeSide.esLeft) {
            this.ReversePolyPtLinks(p2_lft);
            p2_lft.Next = p1_lft;
            p1_lft.Prev = p2_lft;
            p1_rt.Next = p2_rt;
            p2_rt.Prev = p1_rt;
            outRec1.Pts = p2_rt;
         }
         else {
            p2_rt.Next = p1_lft;
            p1_lft.Prev = p2_rt;
            p2_lft.Prev = p1_rt;
            p1_rt.Next = p2_lft;
            outRec1.Pts = p2_lft;
         }
      }
      else {
         if (e2.Side === EdgeSide.esRight) {
            this.ReversePolyPtLinks(p2_lft);
            p1_rt.Next = p2_rt;
            p2_rt.Prev = p1_rt;
            p2_lft.Next = p1_lft;
            p1_lft.Prev = p2_lft;
         }
         else {
            p1_rt.Next = p2_lft;
            p2_lft.Prev = p1_rt;
            p1_lft.Prev = p2_rt;
            p2_rt.Next = p1_lft;
         }
      }
      outRec1.BottomPt = null;
      if (holeStateRec === outRec2) {
         if (outRec2.FirstLeft !== outRec1) outRec1.FirstLeft = outRec2.FirstLeft;
         outRec1.IsHole = SharpJsHelpers.valueClone(outRec2.IsHole);
      }
      outRec2.Pts = null;
      outRec2.BottomPt = null;
      outRec2.FirstLeft = outRec1;
      let OKIdx : number = e1.OutIdx;
      let ObsoleteIdx : number = e2.OutIdx;
      e1.OutIdx = SharpJsHelpers.valueClone(ClipperBase.Unassigned);
      e2.OutIdx = SharpJsHelpers.valueClone(ClipperBase.Unassigned);
      let e : TEdge = this.m_ActiveEdges;
      while (e !== null) {
         if (e.OutIdx === ObsoleteIdx) {
            e.OutIdx = SharpJsHelpers.valueClone(OKIdx);
            e.Side = SharpJsHelpers.valueClone(e1.Side);
            break;
         }
         e = e.NextInAEL;
      }
      outRec2.Idx = SharpJsHelpers.valueClone(outRec1.Idx);
   }
   
   private ReversePolyPtLinks(pp : OutPt) : void {
      if (pp === null) return;
      let pp1 : OutPt = null;
      let pp2 : OutPt = null;
      pp1 = pp;
      do {{
         pp2 = pp1.Next;
         pp1.Next = pp1.Prev;
         pp1.Prev = pp2;
         pp1 = pp2;
      }
      } while(pp1 !== pp);}
   
   private static SwapSides(edge1 : TEdge, edge2 : TEdge) : void {
      let side : EdgeSide = edge1.Side;
      edge1.Side = SharpJsHelpers.valueClone(edge2.Side);
      edge2.Side = SharpJsHelpers.valueClone(side);
   }
   
   private static SwapPolyIndexes(edge1 : TEdge, edge2 : TEdge) : void {
      let outIdx : number = edge1.OutIdx;
      edge1.OutIdx = SharpJsHelpers.valueClone(edge2.OutIdx);
      edge2.OutIdx = SharpJsHelpers.valueClone(outIdx);
   }
   
   private IntersectEdges(e1 : TEdge, e2 : TEdge, pt : IntPoint) : void {
      let e1Contributing : boolean = (e1.OutIdx >= 0);
      let e2Contributing : boolean = (e2.OutIdx >= 0);
      if (e1.WindDelta === 0 || e2.WindDelta === 0) {
         if (e1.WindDelta === 0 && e2.WindDelta === 0) return;
         else if (e1.PolyTyp === e2.PolyTyp && e1.WindDelta !== e2.WindDelta && this.m_ClipType === ClipType.ctUnion) {
            if (e1.WindDelta === 0) {
               if (e2Contributing) {
                  this.AddOutPt(e1, pt);
                  if (e1Contributing) e1.OutIdx = SharpJsHelpers.valueClone(ClipperBase.Unassigned);
               }
            }
            else {
               if (e1Contributing) {
                  this.AddOutPt(e2, pt);
                  if (e2Contributing) e2.OutIdx = SharpJsHelpers.valueClone(ClipperBase.Unassigned);
               }
            }
         }
         else if (e1.PolyTyp !== e2.PolyTyp) {
            if ((e1.WindDelta === 0) && Math.abs(e2.WindCnt) === 1 && (this.m_ClipType !== ClipType.ctUnion || e2.WindCnt2 === 0)) {
               this.AddOutPt(e1, pt);
               if (e1Contributing) e1.OutIdx = SharpJsHelpers.valueClone(ClipperBase.Unassigned);
            }
            else if ((e2.WindDelta === 0) && (Math.abs(e1.WindCnt) === 1) && (this.m_ClipType !== ClipType.ctUnion || e1.WindCnt2 === 0)) {
               this.AddOutPt(e2, pt);
               if (e2Contributing) e2.OutIdx = SharpJsHelpers.valueClone(ClipperBase.Unassigned);
            }
         }
         return;
      }
      if (e1.PolyTyp === e2.PolyTyp) {
         if (this.IsEvenOddFillType(e1)) {
            let oldE1WindCnt : number = e1.WindCnt;
            e1.WindCnt = SharpJsHelpers.valueClone(e2.WindCnt);
            e2.WindCnt = SharpJsHelpers.valueClone(oldE1WindCnt);
         }
         else {
            if (e1.WindCnt + e2.WindDelta === 0) e1.WindCnt = SharpJsHelpers.valueClone(-e1.WindCnt);
            else e1.WindCnt += SharpJsHelpers.valueClone(e2.WindDelta);
            if (e2.WindCnt - e1.WindDelta === 0) e2.WindCnt = SharpJsHelpers.valueClone(-e2.WindCnt);
            else e2.WindCnt -= SharpJsHelpers.valueClone(e1.WindDelta);
         }
      }
      else {
         if (!this.IsEvenOddFillType(e2)) e1.WindCnt2 += SharpJsHelpers.valueClone(e2.WindDelta);
         else e1.WindCnt2 = SharpJsHelpers.valueClone((e1.WindCnt2 === 0) ? 1 : 0);
         if (!this.IsEvenOddFillType(e1)) e2.WindCnt2 -= SharpJsHelpers.valueClone(e1.WindDelta);
         else e2.WindCnt2 = SharpJsHelpers.valueClone((e2.WindCnt2 === 0) ? 1 : 0);
      }
      let e1FillType : PolyFillType = <PolyFillType>0, e2FillType : PolyFillType = <PolyFillType>0, e1FillType2 : PolyFillType = <PolyFillType>0, e2FillType2 : PolyFillType = <PolyFillType>0;
      if (e1.PolyTyp === PolyType.ptSubject) {
         e1FillType = SharpJsHelpers.valueClone(this.m_SubjFillType);
         e1FillType2 = SharpJsHelpers.valueClone(this.m_ClipFillType);
      }
      else {
         e1FillType = SharpJsHelpers.valueClone(this.m_ClipFillType);
         e1FillType2 = SharpJsHelpers.valueClone(this.m_SubjFillType);
      }
      if (e2.PolyTyp === PolyType.ptSubject) {
         e2FillType = SharpJsHelpers.valueClone(this.m_SubjFillType);
         e2FillType2 = SharpJsHelpers.valueClone(this.m_ClipFillType);
      }
      else {
         e2FillType = SharpJsHelpers.valueClone(this.m_ClipFillType);
         e2FillType2 = SharpJsHelpers.valueClone(this.m_SubjFillType);
      }
      let e1Wc : number = 0, e2Wc : number = 0;
      switch (e1FillType) {
         case PolyFillType.pftPositive: {
            e1Wc = SharpJsHelpers.valueClone(e1.WindCnt);
            break;
         }
         case PolyFillType.pftNegative: {
            e1Wc = SharpJsHelpers.valueClone(-e1.WindCnt);
            break;
         }
         default: {
            e1Wc = SharpJsHelpers.valueClone(Math.abs(e1.WindCnt));
            break;
         }
      }
      switch (e2FillType) {
         case PolyFillType.pftPositive: {
            e2Wc = SharpJsHelpers.valueClone(e2.WindCnt);
            break;
         }
         case PolyFillType.pftNegative: {
            e2Wc = SharpJsHelpers.valueClone(-e2.WindCnt);
            break;
         }
         default: {
            e2Wc = SharpJsHelpers.valueClone(Math.abs(e2.WindCnt));
            break;
         }
      }
      if (e1Contributing && e2Contributing) {
         if ((e1Wc !== 0 && e1Wc !== 1) || (e2Wc !== 0 && e2Wc !== 1) || (e1.PolyTyp !== e2.PolyTyp && this.m_ClipType !== ClipType.ctXor)) {
            this.AddLocalMaxPoly(e1, e2, pt);
         }
         else {
            this.AddOutPt(e1, pt);
            this.AddOutPt(e2, pt);
            Clipper.SwapSides(e1, e2);
            Clipper.SwapPolyIndexes(e1, e2);
         }
      }
      else if (e1Contributing) {
         if (e2Wc === 0 || e2Wc === 1) {
            this.AddOutPt(e1, pt);
            Clipper.SwapSides(e1, e2);
            Clipper.SwapPolyIndexes(e1, e2);
         }
      }
      else if (e2Contributing) {
         if (e1Wc === 0 || e1Wc === 1) {
            this.AddOutPt(e2, pt);
            Clipper.SwapSides(e1, e2);
            Clipper.SwapPolyIndexes(e1, e2);
         }
      }
      else if ((e1Wc === 0 || e1Wc === 1) && (e2Wc === 0 || e2Wc === 1)) {
         let e1Wc2 : number = 0, e2Wc2 : number = 0;
         switch (e1FillType2) {
            case PolyFillType.pftPositive: {
               e1Wc2 = SharpJsHelpers.valueClone(e1.WindCnt2);
               break;
            }
            case PolyFillType.pftNegative: {
               e1Wc2 = SharpJsHelpers.valueClone(-e1.WindCnt2);
               break;
            }
            default: {
               e1Wc2 = SharpJsHelpers.valueClone(Math.abs(e1.WindCnt2));
               break;
            }
         }
         switch (e2FillType2) {
            case PolyFillType.pftPositive: {
               e2Wc2 = SharpJsHelpers.valueClone(e2.WindCnt2);
               break;
            }
            case PolyFillType.pftNegative: {
               e2Wc2 = SharpJsHelpers.valueClone(-e2.WindCnt2);
               break;
            }
            default: {
               e2Wc2 = SharpJsHelpers.valueClone(Math.abs(e2.WindCnt2));
               break;
            }
         }
         if (e1.PolyTyp !== e2.PolyTyp) {
            this.AddLocalMinPoly(e1, e2, pt);
         }
         else if (e1Wc === 1 && e2Wc === 1) switch (this.m_ClipType) {
            case ClipType.ctIntersection: {
               if (e1Wc2 > 0 && e2Wc2 > 0) this.AddLocalMinPoly(e1, e2, pt);
               break;
            }
            case ClipType.ctUnion: {
               if (e1Wc2 <= 0 && e2Wc2 <= 0) this.AddLocalMinPoly(e1, e2, pt);
               break;
            }
            case ClipType.ctDifference: {
               if (((e1.PolyTyp === PolyType.ptClip) && (e1Wc2 > 0) && (e2Wc2 > 0)) || ((e1.PolyTyp === PolyType.ptSubject) && (e1Wc2 <= 0) && (e2Wc2 <= 0))) this.AddLocalMinPoly(e1, e2, pt);
               break;
            }
            case ClipType.ctXor: {
               this.AddLocalMinPoly(e1, e2, pt);
               break;
            }
         }
         else Clipper.SwapSides(e1, e2);
      }
   }
   
   private DeleteFromSEL(e : TEdge) : void {
      let SelPrev : TEdge = e.PrevInSEL;
      let SelNext : TEdge = e.NextInSEL;
      if (SelPrev === null && SelNext === null && (e !== this.m_SortedEdges)) return;
      if (SelPrev !== null) SelPrev.NextInSEL = SelNext;
      else this.m_SortedEdges = SelNext;
      if (SelNext !== null) SelNext.PrevInSEL = SelPrev;
      e.NextInSEL = null;
      e.PrevInSEL = null;
   }
   
   private ProcessHorizontals() : void {
      let horzEdge : TEdge = null;
      while (this.PopEdgeFromSEL(createOutRefParam(() => { return SharpJsHelpers.valueClone(horzEdge); }, (__value) => { horzEdge = __value; return SharpJsHelpers.valueClone(__value); }))) this.ProcessHorizontal(horzEdge);
   }
   
   GetHorzDirection(HorzEdge : TEdge, Dir : OutRefParam<Direction>, Left : OutRefParam<number>, Right : OutRefParam<number>) : void {
      if (HorzEdge.Bot.X < HorzEdge.Top.X) {
         Left.write(SharpJsHelpers.valueClone(HorzEdge.Bot.X));
         Right.write(SharpJsHelpers.valueClone(HorzEdge.Top.X));
         Dir.write(SharpJsHelpers.valueClone(Direction.dLeftToRight));
      }
      else {
         Left.write(SharpJsHelpers.valueClone(HorzEdge.Top.X));
         Right.write(SharpJsHelpers.valueClone(HorzEdge.Bot.X));
         Dir.write(SharpJsHelpers.valueClone(Direction.dRightToLeft));
      }
   }
   
   private ProcessHorizontal(horzEdge : TEdge) : void {
      let dir : Direction = <Direction>0;
      let horzLeft : number = 0, horzRight : number = 0;
      let IsOpen : boolean = horzEdge.WindDelta === 0;
      this.GetHorzDirection(horzEdge, createOutRefParam(() => { return SharpJsHelpers.valueClone(dir); }, (__value) => { dir = __value; return SharpJsHelpers.valueClone(__value); }), createOutRefParam(() => { return SharpJsHelpers.valueClone(horzLeft); }, (__value) => { horzLeft = __value; return SharpJsHelpers.valueClone(__value); }), createOutRefParam(() => { return SharpJsHelpers.valueClone(horzRight); }, (__value) => { horzRight = __value; return SharpJsHelpers.valueClone(__value); }));
      let eLastHorz : TEdge = horzEdge, eMaxPair : TEdge = null;
      while (eLastHorz.NextInLML !== null && ClipperBase.IsHorizontal(eLastHorz.NextInLML)) eLastHorz = eLastHorz.NextInLML;
      if (eLastHorz.NextInLML === null) eMaxPair = this.GetMaximaPair(eLastHorz);
      let currMax : Maxima = this.m_Maxima;
      if (currMax !== null) {
         if (dir === Direction.dLeftToRight) {
            while (currMax !== null && currMax.X <= horzEdge.Bot.X) currMax = currMax.Next;
            if (currMax !== null && currMax.X >= eLastHorz.Top.X) currMax = null;
         }
         else {
            while (currMax.Next !== null && currMax.Next.X < horzEdge.Bot.X) currMax = currMax.Next;
            if (currMax.X <= eLastHorz.Top.X) currMax = null;
         }
      }
      let op1 : OutPt = null;
      for (; ; ) {
         let IsLastHorz : boolean = (horzEdge === eLastHorz);
         let e : TEdge = this.GetNextInAEL(horzEdge, dir);
         while (e !== null) {
            if (currMax !== null) {
               if (dir === Direction.dLeftToRight) {
                  while (currMax !== null && currMax.X < e.Curr.X) {
                     if (horzEdge.OutIdx >= 0 && !IsOpen) this.AddOutPt(horzEdge, new IntPoint(currMax.X, horzEdge.Bot.Y));
                     currMax = currMax.Next;
                  }
               }
               else {
                  while (currMax !== null && currMax.X > e.Curr.X) {
                     if (horzEdge.OutIdx >= 0 && !IsOpen) this.AddOutPt(horzEdge, new IntPoint(currMax.X, horzEdge.Bot.Y));
                     currMax = currMax.Prev;
                  }
               }
            }
            {}if ((dir === Direction.dLeftToRight && e.Curr.X > horzRight) || (dir === Direction.dRightToLeft && e.Curr.X < horzLeft)) break;
            if (e.Curr.X === horzEdge.Top.X && horzEdge.NextInLML !== null && e.Dx < horzEdge.NextInLML.Dx) break;
            if (horzEdge.OutIdx >= 0 && !IsOpen) {
               op1 = this.AddOutPt(horzEdge, e.Curr);
               let eNextHorz : TEdge = this.m_SortedEdges;
               while (eNextHorz !== null) {
                  if (eNextHorz.OutIdx >= 0 && this.HorzSegmentsOverlap(horzEdge.Bot.X, horzEdge.Top.X, eNextHorz.Bot.X, eNextHorz.Top.X)) {
                     let op2 : OutPt = this.GetLastOutPt(eNextHorz);
                     this.AddJoin(op2, op1, eNextHorz.Top);
                  }
                  eNextHorz = eNextHorz.NextInSEL;
               }
               this.AddGhostJoin(op1, horzEdge.Bot);
            }
            if (e === eMaxPair && IsLastHorz) {
               if (horzEdge.OutIdx >= 0) this.AddLocalMaxPoly(horzEdge, eMaxPair, horzEdge.Top);
               this.DeleteFromAEL(horzEdge);
               this.DeleteFromAEL(eMaxPair);
               return;
            }
            if (dir === Direction.dLeftToRight) {
               let Pt : IntPoint = new IntPoint(e.Curr.X, horzEdge.Curr.Y);
               this.IntersectEdges(horzEdge, e, Pt);
            }
            else {
               let Pt : IntPoint = new IntPoint(e.Curr.X, horzEdge.Curr.Y);
               this.IntersectEdges(e, horzEdge, Pt);
            }
            let eNext : TEdge = this.GetNextInAEL(e, dir);
            this.SwapPositionsInAEL(horzEdge, e);
            e = eNext;
         }
         if (horzEdge.NextInLML === null || !ClipperBase.IsHorizontal(horzEdge.NextInLML)) break;
         this.UpdateEdgeIntoAEL(createOutRefParam(() => { return SharpJsHelpers.valueClone(horzEdge); }, (__value) => { horzEdge = __value; return SharpJsHelpers.valueClone(__value); }));
         if (horzEdge.OutIdx >= 0) this.AddOutPt(horzEdge, horzEdge.Bot);
         this.GetHorzDirection(horzEdge, createOutRefParam(() => { return SharpJsHelpers.valueClone(dir); }, (__value) => { dir = __value; return SharpJsHelpers.valueClone(__value); }), createOutRefParam(() => { return SharpJsHelpers.valueClone(horzLeft); }, (__value) => { horzLeft = __value; return SharpJsHelpers.valueClone(__value); }), createOutRefParam(() => { return SharpJsHelpers.valueClone(horzRight); }, (__value) => { horzRight = __value; return SharpJsHelpers.valueClone(__value); }));
      }
      if (horzEdge.OutIdx >= 0 && op1 === null) {
         op1 = this.GetLastOutPt(horzEdge);
         let eNextHorz : TEdge = this.m_SortedEdges;
         while (eNextHorz !== null) {
            if (eNextHorz.OutIdx >= 0 && this.HorzSegmentsOverlap(horzEdge.Bot.X, horzEdge.Top.X, eNextHorz.Bot.X, eNextHorz.Top.X)) {
               let op2 : OutPt = this.GetLastOutPt(eNextHorz);
               this.AddJoin(op2, op1, eNextHorz.Top);
            }
            eNextHorz = eNextHorz.NextInSEL;
         }
         this.AddGhostJoin(op1, horzEdge.Top);
      }
      if (horzEdge.NextInLML !== null) {
         if (horzEdge.OutIdx >= 0) {
            op1 = this.AddOutPt(horzEdge, horzEdge.Top);
            this.UpdateEdgeIntoAEL(createOutRefParam(() => { return SharpJsHelpers.valueClone(horzEdge); }, (__value) => { horzEdge = __value; return SharpJsHelpers.valueClone(__value); }));
            if (horzEdge.WindDelta === 0) return;
            let ePrev : TEdge = horzEdge.PrevInAEL;
            let eNext : TEdge = horzEdge.NextInAEL;
            if (ePrev !== null && ePrev.Curr.X === horzEdge.Bot.X && ePrev.Curr.Y === horzEdge.Bot.Y && ePrev.WindDelta !== 0 && (ePrev.OutIdx >= 0 && ePrev.Curr.Y > ePrev.Top.Y && ClipperBase.SlopesEqual(horzEdge, ePrev, this.m_UseFullRange))) {
               let op2 : OutPt = this.AddOutPt(ePrev, horzEdge.Bot);
               this.AddJoin(op1, op2, horzEdge.Top);
            }
            else if (eNext !== null && eNext.Curr.X === horzEdge.Bot.X && eNext.Curr.Y === horzEdge.Bot.Y && eNext.WindDelta !== 0 && eNext.OutIdx >= 0 && eNext.Curr.Y > eNext.Top.Y && ClipperBase.SlopesEqual(horzEdge, eNext, this.m_UseFullRange)) {
               let op2 : OutPt = this.AddOutPt(eNext, horzEdge.Bot);
               this.AddJoin(op1, op2, horzEdge.Top);
            }
         }
         else this.UpdateEdgeIntoAEL(createOutRefParam(() => { return SharpJsHelpers.valueClone(horzEdge); }, (__value) => { horzEdge = __value; return SharpJsHelpers.valueClone(__value); }));
      }
      else {
         if (horzEdge.OutIdx >= 0) this.AddOutPt(horzEdge, horzEdge.Top);
         this.DeleteFromAEL(horzEdge);
      }
   }
   
   private GetNextInAEL(e : TEdge, direction : Direction) : TEdge {
      return direction === Direction.dLeftToRight ? e.NextInAEL : e.PrevInAEL;
   }
   
   private IsMinima(e : TEdge) : boolean {
      return e !== null && (e.Prev.NextInLML !== e) && (e.Next.NextInLML !== e);
   }
   
   private IsMaxima(e : TEdge, Y : number) : boolean {
      return (e !== null && e.Top.Y === Y && e.NextInLML === null);
   }
   
   private IsIntermediate(e : TEdge, Y : number) : boolean {
      return (e.Top.Y === Y && e.NextInLML !== null);
   }
   
   public GetMaximaPair(e : TEdge) : TEdge {
      if ((SharpJsHelpers.tryBinaryOperator(e.Next.Top, e.Top, 'opEquals', (a, b) => a == b)) && e.Next.NextInLML === null) return e.Next;
      else if ((SharpJsHelpers.tryBinaryOperator(e.Prev.Top, e.Top, 'opEquals', (a, b) => a == b)) && e.Prev.NextInLML === null) return e.Prev;
      else return null;
   }
   
   public GetMaximaPairEx(e : TEdge) : TEdge {
      let result : TEdge = this.GetMaximaPair(e);
      if (result === null || result.OutIdx === ClipperBase.Skip || ((result.NextInAEL === result.PrevInAEL) && !ClipperBase.IsHorizontal(result))) return null;
      return result;
   }
   
   private ProcessIntersections(topY : number) : boolean {
      if (this.m_ActiveEdges === null) return true;
      try {
         this.BuildIntersectList(topY);
         if (this.m_IntersectList.length === 0) return true;
         if (this.m_IntersectList.length === 1 || this.FixupIntersectionOrder()) this.ProcessIntersectList();
         else return false;
      }
       catch(e) {// SJSTODO: Catch not implemented!
      }
      this.m_SortedEdges = null;
      return true;
   }
   
   private BuildIntersectList(topY : number) : void {
      if (this.m_ActiveEdges === null) return;
      let e : TEdge = this.m_ActiveEdges;
      this.m_SortedEdges = e;
      while (e !== null) {
         e.PrevInSEL = e.PrevInAEL;
         e.NextInSEL = e.NextInAEL;
         e.Curr.X = SharpJsHelpers.valueClone(Clipper.TopX(e, topY));
         e = e.NextInAEL;
      }
      let isModified : boolean = true;
      while (isModified && this.m_SortedEdges !== null) {
         isModified = SharpJsHelpers.valueClone(false);
         e = this.m_SortedEdges;
         while (e.NextInSEL !== null) {
            let eNext : TEdge = e.NextInSEL;
            let pt : IntPoint = IntPoint.default();
            if (e.Curr.X > eNext.Curr.X) {
               this.IntersectPoint(e, eNext, createOutRefParam(() => { return SharpJsHelpers.valueClone(pt); }, (__value) => { pt = __value; return SharpJsHelpers.valueClone(__value); }));
               if (pt.Y < topY) pt = SharpJsHelpers.valueClone(new IntPoint(Clipper.TopX(e, topY), topY));
               let newNode : IntersectNode = new IntersectNode();
               newNode.Edge1 = e;
               newNode.Edge2 = eNext;
               newNode.Pt = SharpJsHelpers.valueClone(pt);
               this.m_IntersectList.push(newNode);
               this.SwapPositionsInSEL(e, eNext);
               isModified = SharpJsHelpers.valueClone(true);
            }
            else e = eNext;
         }
         if (e.PrevInSEL !== null) e.PrevInSEL.NextInSEL = null;
         else break;
      }
      this.m_SortedEdges = null;
   }
   
   private EdgesAdjacent(inode : IntersectNode) : boolean {
      return (inode.Edge1.NextInSEL === inode.Edge2) || (inode.Edge1.PrevInSEL === inode.Edge2);
   }
   
   private static IntersectNodeSort(node1 : IntersectNode, node2 : IntersectNode) : number {
      return <number>(node2.Pt.Y - node1.Pt.Y);
   }
   
   private FixupIntersectionOrder() : boolean {
      this.m_IntersectList.sort((cmpLeft, cmpRight) => this.m_IntersectNodeComparer.Compare(cmpLeft, cmpRight));
      this.CopyAELToSEL();
      let cnt : number = this.m_IntersectList.length;
      for (let i : number = 0; i < cnt; i++) {
         if (!this.EdgesAdjacent(this.m_IntersectList[i])) {
            let j : number = i + 1;
            while (j < cnt && !this.EdgesAdjacent(this.m_IntersectList[j])) j++;
            if (j === cnt) return false;
            let tmp : IntersectNode = this.m_IntersectList[i];
            this.m_IntersectList[i] = this.m_IntersectList[j];
            this.m_IntersectList[j] = tmp;
         }
         this.SwapPositionsInSEL(this.m_IntersectList[i].Edge1, this.m_IntersectList[i].Edge2);
      }
      return true;
   }
   
   private ProcessIntersectList() : void {
      for (let i : number = 0; i < this.m_IntersectList.length; i++) {
         let iNode : IntersectNode = this.m_IntersectList[i];
         {
            this.IntersectEdges(iNode.Edge1, iNode.Edge2, iNode.Pt);
            this.SwapPositionsInAEL(iNode.Edge1, iNode.Edge2);
         }
      }
      SharpJsHelpers.arrayClear(this.m_IntersectList);
   }
   
   public static Round(value : number) : number {
      return value < 0 ? <number>(value - 0.5) : <number>(value + 0.5);
   }
   
   private static TopX(edge : TEdge, currentY : number) : number {
      if (currentY === edge.Top.Y) return edge.Top.X;
      return edge.Bot.X + Clipper.Round(edge.Dx * (currentY - edge.Bot.Y));
   }
   
   private IntersectPoint(edge1 : TEdge, edge2 : TEdge, ip : OutRefParam<IntPoint>) : void {
      ip.write(SharpJsHelpers.valueClone(new IntPoint()));
      let b1 : number = 0, b2 : number = 0;
      if (edge1.Dx === edge2.Dx) {
         ip.read().Y = SharpJsHelpers.valueClone(edge1.Curr.Y);
         ip.read().X = SharpJsHelpers.valueClone(Clipper.TopX(edge1, ip.read().Y));
         return;
      }
      if (edge1.Delta.X === 0) {
         ip.read().X = SharpJsHelpers.valueClone(edge1.Bot.X);
         if (ClipperBase.IsHorizontal(edge2)) {
            ip.read().Y = SharpJsHelpers.valueClone(edge2.Bot.Y);
         }
         else {
            b2 = SharpJsHelpers.valueClone(edge2.Bot.Y - (edge2.Bot.X / edge2.Dx));
            ip.read().Y = SharpJsHelpers.valueClone(Clipper.Round(ip.read().X / edge2.Dx + b2));
         }
      }
      else if (edge2.Delta.X === 0) {
         ip.read().X = SharpJsHelpers.valueClone(edge2.Bot.X);
         if (ClipperBase.IsHorizontal(edge1)) {
            ip.read().Y = SharpJsHelpers.valueClone(edge1.Bot.Y);
         }
         else {
            b1 = SharpJsHelpers.valueClone(edge1.Bot.Y - (edge1.Bot.X / edge1.Dx));
            ip.read().Y = SharpJsHelpers.valueClone(Clipper.Round(ip.read().X / edge1.Dx + b1));
         }
      }
      else {
         b1 = SharpJsHelpers.valueClone(edge1.Bot.X - edge1.Bot.Y * edge1.Dx);
         b2 = SharpJsHelpers.valueClone(edge2.Bot.X - edge2.Bot.Y * edge2.Dx);
         let q : number = (b2 - b1) / (edge1.Dx - edge2.Dx);
         ip.read().Y = SharpJsHelpers.valueClone(Clipper.Round(q));
         if (Math.abs(edge1.Dx) < Math.abs(edge2.Dx)) ip.read().X = SharpJsHelpers.valueClone(Clipper.Round(edge1.Dx * q + b1));
         else ip.read().X = SharpJsHelpers.valueClone(Clipper.Round(edge2.Dx * q + b2));
      }
      if (ip.read().Y < edge1.Top.Y || ip.read().Y < edge2.Top.Y) {
         if (edge1.Top.Y > edge2.Top.Y) ip.read().Y = SharpJsHelpers.valueClone(edge1.Top.Y);
         else ip.read().Y = SharpJsHelpers.valueClone(edge2.Top.Y);
         if (Math.abs(edge1.Dx) < Math.abs(edge2.Dx)) ip.read().X = SharpJsHelpers.valueClone(Clipper.TopX(edge1, ip.read().Y));
         else ip.read().X = SharpJsHelpers.valueClone(Clipper.TopX(edge2, ip.read().Y));
      }
      if (ip.read().Y > edge1.Curr.Y) {
         ip.read().Y = SharpJsHelpers.valueClone(edge1.Curr.Y);
         if (Math.abs(edge1.Dx) > Math.abs(edge2.Dx)) ip.read().X = SharpJsHelpers.valueClone(Clipper.TopX(edge2, ip.read().Y));
         else ip.read().X = SharpJsHelpers.valueClone(Clipper.TopX(edge1, ip.read().Y));
      }
   }
   
   private ProcessEdgesAtTopOfScanbeam(topY : number) : void {
      let e : TEdge = this.m_ActiveEdges;
      while (e !== null) {
         let IsMaximaEdge : boolean = this.IsMaxima(e, topY);
         if (IsMaximaEdge) {
            let eMaxPair : TEdge = this.GetMaximaPairEx(e);
            IsMaximaEdge = SharpJsHelpers.valueClone((eMaxPair === null || !ClipperBase.IsHorizontal(eMaxPair)));
         }
         if (IsMaximaEdge) {
            if (this.StrictlySimple) this.InsertMaxima(e.Top.X);
            let ePrev : TEdge = e.PrevInAEL;
            this.DoMaxima(e);
            if (ePrev === null) e = this.m_ActiveEdges;
            else e = ePrev.NextInAEL;
         }
         else {
            if (this.IsIntermediate(e, topY) && ClipperBase.IsHorizontal(e.NextInLML)) {
               this.UpdateEdgeIntoAEL(createOutRefParam(() => { return SharpJsHelpers.valueClone(e); }, (__value) => { e = __value; return SharpJsHelpers.valueClone(__value); }));
               if (e.OutIdx >= 0) this.AddOutPt(e, e.Bot);
               this.AddEdgeToSEL(e);
            }
            else {
               e.Curr.X = SharpJsHelpers.valueClone(Clipper.TopX(e, topY));
               e.Curr.Y = SharpJsHelpers.valueClone(topY);
            }
            if (this.StrictlySimple) {
               let ePrev : TEdge = e.PrevInAEL;
               if ((e.OutIdx >= 0) && (e.WindDelta !== 0) && ePrev !== null && (ePrev.OutIdx >= 0) && (ePrev.Curr.X === e.Curr.X) && (ePrev.WindDelta !== 0)) {
                  let ip : IntPoint = e.Curr;
                  let op : OutPt = this.AddOutPt(ePrev, ip);
                  let op2 : OutPt = this.AddOutPt(e, ip);
                  this.AddJoin(op, op2, ip);
               }
            }
            e = e.NextInAEL;
         }
      }
      this.ProcessHorizontals();
      this.m_Maxima = null;
      e = this.m_ActiveEdges;
      while (e !== null) {
         if (this.IsIntermediate(e, topY)) {
            let op : OutPt = null;
            if (e.OutIdx >= 0) op = this.AddOutPt(e, e.Top);
            this.UpdateEdgeIntoAEL(createOutRefParam(() => { return SharpJsHelpers.valueClone(e); }, (__value) => { e = __value; return SharpJsHelpers.valueClone(__value); }));
            let ePrev : TEdge = e.PrevInAEL;
            let eNext : TEdge = e.NextInAEL;
            if (ePrev !== null && ePrev.Curr.X === e.Bot.X && ePrev.Curr.Y === e.Bot.Y && op !== null && ePrev.OutIdx >= 0 && ePrev.Curr.Y > ePrev.Top.Y && ClipperBase.SlopesEqual(e.Curr, e.Top, ePrev.Curr, ePrev.Top, this.m_UseFullRange) && (e.WindDelta !== 0) && (ePrev.WindDelta !== 0)) {
               let op2 : OutPt = this.AddOutPt(ePrev, e.Bot);
               this.AddJoin(op, op2, e.Top);
            }
            else if (eNext !== null && eNext.Curr.X === e.Bot.X && eNext.Curr.Y === e.Bot.Y && op !== null && eNext.OutIdx >= 0 && eNext.Curr.Y > eNext.Top.Y && ClipperBase.SlopesEqual(e.Curr, e.Top, eNext.Curr, eNext.Top, this.m_UseFullRange) && (e.WindDelta !== 0) && (eNext.WindDelta !== 0)) {
               let op2 : OutPt = this.AddOutPt(eNext, e.Bot);
               this.AddJoin(op, op2, e.Top);
            }
         }
         e = e.NextInAEL;
      }
   }
   
   private DoMaxima(e : TEdge) : void {
      let eMaxPair : TEdge = this.GetMaximaPairEx(e);
      if (eMaxPair === null) {
         if (e.OutIdx >= 0) this.AddOutPt(e, e.Top);
         this.DeleteFromAEL(e);
         return;
      }
      let eNext : TEdge = e.NextInAEL;
      while (eNext !== null && eNext !== eMaxPair) {
         this.IntersectEdges(e, eNext, e.Top);
         this.SwapPositionsInAEL(e, eNext);
         eNext = e.NextInAEL;
      }
      if (e.OutIdx === ClipperBase.Unassigned && eMaxPair.OutIdx === ClipperBase.Unassigned) {
         this.DeleteFromAEL(e);
         this.DeleteFromAEL(eMaxPair);
      }
      else if (e.OutIdx >= 0 && eMaxPair.OutIdx >= 0) {
         if (e.OutIdx >= 0) this.AddLocalMaxPoly(e, eMaxPair, e.Top);
         this.DeleteFromAEL(e);
         this.DeleteFromAEL(eMaxPair);
      }
      else if (e.WindDelta === 0) {
         if (e.OutIdx >= 0) {
            this.AddOutPt(e, e.Top);
            e.OutIdx = SharpJsHelpers.valueClone(ClipperBase.Unassigned);
         }
         this.DeleteFromAEL(e);
         if (eMaxPair.OutIdx >= 0) {
            this.AddOutPt(eMaxPair, e.Top);
            eMaxPair.OutIdx = SharpJsHelpers.valueClone(ClipperBase.Unassigned);
         }
         this.DeleteFromAEL(eMaxPair);
      }
      else throw new ClipperException("DoMaxima error");
   }
   
   public static ReversePaths(polys : Array<Array<IntPoint>>) : void {
      for (let poly of polys) {
         poly.reverse();
      }
   }
   
   public static Orientation(poly : Array<IntPoint>) : boolean {
      return Clipper.Area(poly) >= 0;
   }
   
   private PointCount(pts : OutPt) : number {
      if (pts === null) return 0;
      let result : number = 0;
      let p : OutPt = pts;
      do {{
         result++;
         p = p.Next;
      }
      } while(p !== pts);return result;
   }
   
   private BuildResult(polyg : Array<Array<IntPoint>>) : void {
      SharpJsHelpers.arrayClear(polyg);
      SharpJsHelpers.setCapacity(polyg, this.m_PolyOuts.length);
      for (let i : number = 0; i < this.m_PolyOuts.length; i++) {
         let outRec : OutRec = this.m_PolyOuts[i];
         if (outRec.Pts === null) continue;
         let p : OutPt = outRec.Pts.Prev;
         let cnt : number = this.PointCount(p);
         if (cnt < 2) continue;
         let pg : Array<IntPoint> = new Array<IntPoint>();
         for (let j : number = 0; j < cnt; j++) {
            pg.push(p.Pt);
            p = p.Prev;
         }
         polyg.push(pg);
      }
   }
   
   private BuildResult2(polytree : PolyTree) : void {
      polytree.Clear();
      SharpJsHelpers.setCapacity(polytree.m_AllPolys, this.m_PolyOuts.length);
      for (let i : number = 0; i < this.m_PolyOuts.length; i++) {
         let outRec : OutRec = this.m_PolyOuts[i];
         let cnt : number = this.PointCount(outRec.Pts);
         if ((outRec.IsOpen && cnt < 2) || (!outRec.IsOpen && cnt < 3)) continue;
         this.FixHoleLinkage(outRec);
         let pn : PolyNode = new PolyNode();
         polytree.m_AllPolys.push(pn);
         outRec.PolyNode = pn;
         SharpJsHelpers.setCapacity(pn.m_polygon, cnt);
         let op : OutPt = outRec.Pts.Prev;
         for (let j : number = 0; j < cnt; j++) {
            pn.m_polygon.push(op.Pt);
            op = op.Prev;
         }
      }
      SharpJsHelpers.setCapacity(polytree.m_Childs, this.m_PolyOuts.length);
      for (let i : number = 0; i < this.m_PolyOuts.length; i++) {
         let outRec : OutRec = this.m_PolyOuts[i];
         if (outRec.PolyNode === null) continue;
         else if (outRec.IsOpen) {
            outRec.PolyNode.IsOpen = SharpJsHelpers.valueClone(true);
            polytree.AddChild(outRec.PolyNode);
         }
         else if (outRec.FirstLeft !== null && outRec.FirstLeft.PolyNode !== null) outRec.FirstLeft.PolyNode.AddChild(outRec.PolyNode);
         else polytree.AddChild(outRec.PolyNode);
      }
   }
   
   private FixupOutPolyline(outrec : OutRec) : void {
      let pp : OutPt = outrec.Pts;
      let lastPP : OutPt = pp.Prev;
      while (pp !== lastPP) {
         pp = pp.Next;
         if (SharpJsHelpers.tryBinaryOperator(pp.Pt, pp.Prev.Pt, 'opEquals', (a, b) => a == b)) {
            if (pp === lastPP) lastPP = pp.Prev;
            let tmpPP : OutPt = pp.Prev;
            tmpPP.Next = pp.Next;
            pp.Next.Prev = tmpPP;
            pp = tmpPP;
         }
      }
      if (pp === pp.Prev) outrec.Pts = null;
   }
   
   private FixupOutPolygon(outRec : OutRec) : void {
      let lastOK : OutPt = null;
      outRec.BottomPt = null;
      let pp : OutPt = outRec.Pts;
      let preserveCol : boolean = this.PreserveCollinear || this.StrictlySimple;
      for (; ; ) {
         if (pp.Prev === pp || pp.Prev === pp.Next) {
            outRec.Pts = null;
            return;
         }
         if ((SharpJsHelpers.tryBinaryOperator(pp.Pt, pp.Next.Pt, 'opEquals', (a, b) => a == b)) || (SharpJsHelpers.tryBinaryOperator(pp.Pt, pp.Prev.Pt, 'opEquals', (a, b) => a == b)) || (ClipperBase.SlopesEqual(pp.Prev.Pt, pp.Pt, pp.Next.Pt, this.m_UseFullRange) && (!preserveCol || !this.Pt2IsBetweenPt1AndPt3(pp.Prev.Pt, pp.Pt, pp.Next.Pt)))) {
            lastOK = null;
            pp.Prev.Next = pp.Next;
            pp.Next.Prev = pp.Prev;
            pp = pp.Prev;
         }
         else if (pp === lastOK) break;
         else {
            if (lastOK === null) lastOK = pp;
            pp = pp.Next;
         }
      }
      outRec.Pts = pp;
   }
   
   DupOutPt(outPt : OutPt, InsertAfter : boolean) : OutPt {
      let result : OutPt = new OutPt();
      result.Pt = SharpJsHelpers.valueClone(outPt.Pt);
      result.Idx = SharpJsHelpers.valueClone(outPt.Idx);
      if (InsertAfter) {
         result.Next = outPt.Next;
         result.Prev = outPt;
         outPt.Next.Prev = result;
         outPt.Next = result;
      }
      else {
         result.Prev = outPt.Prev;
         result.Next = outPt;
         outPt.Prev.Next = result;
         outPt.Prev = result;
      }
      return result;
   }
   
   GetOverlap(a1 : number, a2 : number, b1 : number, b2 : number, Left : OutRefParam<number>, Right : OutRefParam<number>) : boolean {
      if (a1 < a2) {
         if (b1 < b2) {
            Left.write(SharpJsHelpers.valueClone(Math.max(a1, b1)));
            Right.write(SharpJsHelpers.valueClone(Math.min(a2, b2)));
         }
         else {
            Left.write(SharpJsHelpers.valueClone(Math.max(a1, b2)));
            Right.write(SharpJsHelpers.valueClone(Math.min(a2, b1)));
         }
      }
      else {
         if (b1 < b2) {
            Left.write(SharpJsHelpers.valueClone(Math.max(a2, b1)));
            Right.write(SharpJsHelpers.valueClone(Math.min(a1, b2)));
         }
         else {
            Left.write(SharpJsHelpers.valueClone(Math.max(a2, b2)));
            Right.write(SharpJsHelpers.valueClone(Math.min(a1, b1)));
         }
      }
      return Left.read() < Right.read();
   }
   
   JoinHorz(op1 : OutPt, op1b : OutPt, op2 : OutPt, op2b : OutPt, Pt : IntPoint, DiscardLeft : boolean) : boolean {
      let Dir1 : Direction = (op1.Pt.X > op1b.Pt.X ? Direction.dRightToLeft : Direction.dLeftToRight);
      let Dir2 : Direction = (op2.Pt.X > op2b.Pt.X ? Direction.dRightToLeft : Direction.dLeftToRight);
      if (Dir1 === Dir2) return false;
      if (Dir1 === Direction.dLeftToRight) {
         while (op1.Next.Pt.X <= Pt.X && op1.Next.Pt.X >= op1.Pt.X && op1.Next.Pt.Y === Pt.Y) op1 = op1.Next;
         if (DiscardLeft && (op1.Pt.X !== Pt.X)) op1 = op1.Next;
         op1b = this.DupOutPt(op1, !DiscardLeft);
         if (SharpJsHelpers.tryBinaryOperator(op1b.Pt, Pt, 'opNotEquals', (a, b) => a != b)) {
            op1 = op1b;
            op1.Pt = SharpJsHelpers.valueClone(Pt);
            op1b = this.DupOutPt(op1, !DiscardLeft);
         }
      }
      else {
         while (op1.Next.Pt.X >= Pt.X && op1.Next.Pt.X <= op1.Pt.X && op1.Next.Pt.Y === Pt.Y) op1 = op1.Next;
         if (!DiscardLeft && (op1.Pt.X !== Pt.X)) op1 = op1.Next;
         op1b = this.DupOutPt(op1, DiscardLeft);
         if (SharpJsHelpers.tryBinaryOperator(op1b.Pt, Pt, 'opNotEquals', (a, b) => a != b)) {
            op1 = op1b;
            op1.Pt = SharpJsHelpers.valueClone(Pt);
            op1b = this.DupOutPt(op1, DiscardLeft);
         }
      }
      if (Dir2 === Direction.dLeftToRight) {
         while (op2.Next.Pt.X <= Pt.X && op2.Next.Pt.X >= op2.Pt.X && op2.Next.Pt.Y === Pt.Y) op2 = op2.Next;
         if (DiscardLeft && (op2.Pt.X !== Pt.X)) op2 = op2.Next;
         op2b = this.DupOutPt(op2, !DiscardLeft);
         if (SharpJsHelpers.tryBinaryOperator(op2b.Pt, Pt, 'opNotEquals', (a, b) => a != b)) {
            op2 = op2b;
            op2.Pt = SharpJsHelpers.valueClone(Pt);
            op2b = this.DupOutPt(op2, !DiscardLeft);
         }
         {}}
      else {
         while (op2.Next.Pt.X >= Pt.X && op2.Next.Pt.X <= op2.Pt.X && op2.Next.Pt.Y === Pt.Y) op2 = op2.Next;
         if (!DiscardLeft && (op2.Pt.X !== Pt.X)) op2 = op2.Next;
         op2b = this.DupOutPt(op2, DiscardLeft);
         if (SharpJsHelpers.tryBinaryOperator(op2b.Pt, Pt, 'opNotEquals', (a, b) => a != b)) {
            op2 = op2b;
            op2.Pt = SharpJsHelpers.valueClone(Pt);
            op2b = this.DupOutPt(op2, DiscardLeft);
         }
         {}}
      {}if ((Dir1 === Direction.dLeftToRight) === DiscardLeft) {
         op1.Prev = op2;
         op2.Next = op1;
         op1b.Next = op2b;
         op2b.Prev = op1b;
      }
      else {
         op1.Next = op2;
         op2.Prev = op1;
         op1b.Prev = op2b;
         op2b.Next = op1b;
      }
      return true;
   }
   
   private JoinPoints(j : Join, outRec1 : OutRec, outRec2 : OutRec) : boolean {
      let op1 : OutPt = j.OutPt1, op1b : OutPt = null;
      let op2 : OutPt = j.OutPt2, op2b : OutPt = null;
      let isHorizontal : boolean = (j.OutPt1.Pt.Y === j.OffPt.Y);
      if (isHorizontal && (SharpJsHelpers.tryBinaryOperator(j.OffPt, j.OutPt1.Pt, 'opEquals', (a, b) => a == b)) && (SharpJsHelpers.tryBinaryOperator(j.OffPt, j.OutPt2.Pt, 'opEquals', (a, b) => a == b))) {
         if (outRec1 !== outRec2) return false;
         op1b = j.OutPt1.Next;
         while (op1b !== op1 && (SharpJsHelpers.tryBinaryOperator(op1b.Pt, j.OffPt, 'opEquals', (a, b) => a == b))) op1b = op1b.Next;
         let reverse1 : boolean = (op1b.Pt.Y > j.OffPt.Y);
         op2b = j.OutPt2.Next;
         while (op2b !== op2 && (SharpJsHelpers.tryBinaryOperator(op2b.Pt, j.OffPt, 'opEquals', (a, b) => a == b))) op2b = op2b.Next;
         let reverse2 : boolean = (op2b.Pt.Y > j.OffPt.Y);
         if (reverse1 === reverse2) return false;
         if (reverse1) {
            op1b = this.DupOutPt(op1, false);
            op2b = this.DupOutPt(op2, true);
            op1.Prev = op2;
            op2.Next = op1;
            op1b.Next = op2b;
            op2b.Prev = op1b;
            j.OutPt1 = op1;
            j.OutPt2 = op1b;
            return true;
         }
         else {
            op1b = this.DupOutPt(op1, true);
            op2b = this.DupOutPt(op2, false);
            op1.Next = op2;
            op2.Prev = op1;
            op1b.Prev = op2b;
            op2b.Next = op1b;
            j.OutPt1 = op1;
            j.OutPt2 = op1b;
            return true;
         }
      }
      else if (isHorizontal) {
         op1b = op1;
         while (op1.Prev.Pt.Y === op1.Pt.Y && op1.Prev !== op1b && op1.Prev !== op2) op1 = op1.Prev;
         while (op1b.Next.Pt.Y === op1b.Pt.Y && op1b.Next !== op1 && op1b.Next !== op2) op1b = op1b.Next;
         if (op1b.Next === op1 || op1b.Next === op2) return false;
         op2b = op2;
         while (op2.Prev.Pt.Y === op2.Pt.Y && op2.Prev !== op2b && op2.Prev !== op1b) op2 = op2.Prev;
         while (op2b.Next.Pt.Y === op2b.Pt.Y && op2b.Next !== op2 && op2b.Next !== op1) op2b = op2b.Next;
         if (op2b.Next === op2 || op2b.Next === op1) return false;
         let Left : number = 0, Right : number = 0;
         if (!this.GetOverlap(op1.Pt.X, op1b.Pt.X, op2.Pt.X, op2b.Pt.X, createOutRefParam(() => { return SharpJsHelpers.valueClone(Left); }, (__value) => { Left = __value; return SharpJsHelpers.valueClone(__value); }), createOutRefParam(() => { return SharpJsHelpers.valueClone(Right); }, (__value) => { Right = __value; return SharpJsHelpers.valueClone(__value); }))) return false;
         let Pt : IntPoint = IntPoint.default();
         let DiscardLeftSide : boolean = false;
         if (op1.Pt.X >= Left && op1.Pt.X <= Right) {
            Pt = SharpJsHelpers.valueClone(op1.Pt);
            DiscardLeftSide = SharpJsHelpers.valueClone((op1.Pt.X > op1b.Pt.X));
         }
         else if (op2.Pt.X >= Left && op2.Pt.X <= Right) {
            Pt = SharpJsHelpers.valueClone(op2.Pt);
            DiscardLeftSide = SharpJsHelpers.valueClone((op2.Pt.X > op2b.Pt.X));
         }
         else if (op1b.Pt.X >= Left && op1b.Pt.X <= Right) {
            Pt = SharpJsHelpers.valueClone(op1b.Pt);
            DiscardLeftSide = SharpJsHelpers.valueClone(op1b.Pt.X > op1.Pt.X);
         }
         else {
            Pt = SharpJsHelpers.valueClone(op2b.Pt);
            DiscardLeftSide = SharpJsHelpers.valueClone((op2b.Pt.X > op2.Pt.X));
         }
         j.OutPt1 = op1;
         j.OutPt2 = op2;
         return this.JoinHorz(op1, op1b, op2, op2b, Pt, DiscardLeftSide);
      }
      else {
         op1b = op1.Next;
         while ((SharpJsHelpers.tryBinaryOperator(op1b.Pt, op1.Pt, 'opEquals', (a, b) => a == b)) && (op1b !== op1)) op1b = op1b.Next;
         let Reverse1 : boolean = ((op1b.Pt.Y > op1.Pt.Y) || !ClipperBase.SlopesEqual(op1.Pt, op1b.Pt, j.OffPt, this.m_UseFullRange));
         if (Reverse1) {
            op1b = op1.Prev;
            while ((SharpJsHelpers.tryBinaryOperator(op1b.Pt, op1.Pt, 'opEquals', (a, b) => a == b)) && (op1b !== op1)) op1b = op1b.Prev;
            if ((op1b.Pt.Y > op1.Pt.Y) || !ClipperBase.SlopesEqual(op1.Pt, op1b.Pt, j.OffPt, this.m_UseFullRange)) return false;
         }
         {}op2b = op2.Next;
         while ((SharpJsHelpers.tryBinaryOperator(op2b.Pt, op2.Pt, 'opEquals', (a, b) => a == b)) && (op2b !== op2)) op2b = op2b.Next;
         let Reverse2 : boolean = ((op2b.Pt.Y > op2.Pt.Y) || !ClipperBase.SlopesEqual(op2.Pt, op2b.Pt, j.OffPt, this.m_UseFullRange));
         if (Reverse2) {
            op2b = op2.Prev;
            while ((SharpJsHelpers.tryBinaryOperator(op2b.Pt, op2.Pt, 'opEquals', (a, b) => a == b)) && (op2b !== op2)) op2b = op2b.Prev;
            if ((op2b.Pt.Y > op2.Pt.Y) || !ClipperBase.SlopesEqual(op2.Pt, op2b.Pt, j.OffPt, this.m_UseFullRange)) return false;
         }
         if ((op1b === op1) || (op2b === op2) || (op1b === op2b) || ((outRec1 === outRec2) && (Reverse1 === Reverse2))) return false;
         if (Reverse1) {
            op1b = this.DupOutPt(op1, false);
            op2b = this.DupOutPt(op2, true);
            op1.Prev = op2;
            op2.Next = op1;
            op1b.Next = op2b;
            op2b.Prev = op1b;
            j.OutPt1 = op1;
            j.OutPt2 = op1b;
            return true;
         }
         else {
            op1b = this.DupOutPt(op1, true);
            op2b = this.DupOutPt(op2, false);
            op1.Next = op2;
            op2.Prev = op1;
            op1b.Prev = op2b;
            op2b.Next = op1b;
            j.OutPt1 = op1;
            j.OutPt2 = op1b;
            return true;
         }
      }
   }
   
   public static PointInPolygon_SharpJs_Overload_0(pt : IntPoint, path : Array<IntPoint>) : number {
      let result : number = 0, cnt : number = path.length;
      if (cnt < 3) return 0;
      let ip : IntPoint = path[0];
      for (let i : number = 1; i <= cnt; ++i) {
         let ipNext : IntPoint = (i === cnt ? path[0] : path[i]);
         if (ipNext.Y === pt.Y) {
            if ((ipNext.X === pt.X) || (ip.Y === pt.Y && ((ipNext.X > pt.X) === (ip.X < pt.X)))) return <number>(-1);
         }
         if ((ip.Y < pt.Y) !== (ipNext.Y < pt.Y)) {
            if (ip.X >= pt.X) {
               if (ipNext.X > pt.X) result = SharpJsHelpers.valueClone(1 - result);
               else {
                  let d : number = <number>(ip.X - pt.X) * (ipNext.Y - pt.Y) - <number>(ipNext.X - pt.X) * (ip.Y - pt.Y);
                  if (d === 0) return <number>(-1);
                  else if ((d > 0) === (ipNext.Y > ip.Y)) result = SharpJsHelpers.valueClone(1 - result);
               }
            }
            else {
               if (ipNext.X > pt.X) {
                  let d : number = <number>(ip.X - pt.X) * (ipNext.Y - pt.Y) - <number>(ipNext.X - pt.X) * (ip.Y - pt.Y);
                  if (d === 0) return <number>(-1);
                  else if ((d > 0) === (ipNext.Y > ip.Y)) result = SharpJsHelpers.valueClone(1 - result);
               }
            }
         }
         ip = SharpJsHelpers.valueClone(ipNext);
      }
      return <number>result;
   }
   
   private static PointInPolygon_SharpJs_Overload_1(pt : IntPoint, op : OutPt) : number {
      let result : number = 0;
      let startOp : OutPt = op;
      let ptx : number = pt.X, pty : number = pt.Y;
      let poly0x : number = op.Pt.X, poly0y : number = op.Pt.Y;
      do {{
         op = op.Next;
         let poly1x : number = op.Pt.X, poly1y : number = op.Pt.Y;
         if (poly1y === pty) {
            if ((poly1x === ptx) || (poly0y === pty && ((poly1x > ptx) === (poly0x < ptx)))) return -1;
         }
         if ((poly0y < pty) !== (poly1y < pty)) {
            if (poly0x >= ptx) {
               if (poly1x > ptx) result = SharpJsHelpers.valueClone(1 - result);
               else {
                  let d : number = <number>(poly0x - ptx) * (poly1y - pty) - <number>(poly1x - ptx) * (poly0y - pty);
                  if (d === 0) return -1;
                  if ((d > 0) === (poly1y > poly0y)) result = SharpJsHelpers.valueClone(1 - result);
               }
            }
            else {
               if (poly1x > ptx) {
                  let d : number = <number>(poly0x - ptx) * (poly1y - pty) - <number>(poly1x - ptx) * (poly0y - pty);
                  if (d === 0) return -1;
                  if ((d > 0) === (poly1y > poly0y)) result = SharpJsHelpers.valueClone(1 - result);
               }
            }
         }
         poly0x = SharpJsHelpers.valueClone(poly1x);
         poly0y = SharpJsHelpers.valueClone(poly1y);
      }
      } while(startOp !== op);return result;
   }
   
   public static PointInPolygon(pt : IntPoint, path : Array<IntPoint>) : number;
   public static PointInPolygon(pt : IntPoint, op : OutPt) : number;
   public static PointInPolygon(...args: any[]): number | number {
      if (args.length == 2 && SharpJsHelpers.TestTypeCheck(args[0], IntPoint) && SharpJsHelpers.TestTypeCheck(args[1], Array)) return Clipper.PointInPolygon_SharpJs_Overload_0(<IntPoint>args[0], <Array<IntPoint>>args[1]);
      else if (args.length == 2 && SharpJsHelpers.TestTypeCheck(args[0], IntPoint) && SharpJsHelpers.TestTypeCheck(args[1], OutPt)) return Clipper.PointInPolygon_SharpJs_Overload_1(<IntPoint>args[0], <OutPt>args[1]);
      throw new Error('SharpJS: Failed to match method overload. This can be due to differences in C#/JS type system.');
   }
   
   private static Poly2ContainsPoly1(outPt1 : OutPt, outPt2 : OutPt) : boolean {
      let op : OutPt = outPt1;
      do {{
         let res : number = Clipper.PointInPolygon(op.Pt, outPt2);
         if (res >= 0) return res > 0;
         op = op.Next;
      }
      } while(op !== outPt1);return true;
   }
   
   private FixupFirstLefts1(OldOutRec : OutRec, NewOutRec : OutRec) : void {
      for (let outRec of this.m_PolyOuts) {
         let firstLeft : OutRec = Clipper.ParseFirstLeft(outRec.FirstLeft);
         if (outRec.Pts !== null && firstLeft === OldOutRec) {
            if (Clipper.Poly2ContainsPoly1(outRec.Pts, NewOutRec.Pts)) outRec.FirstLeft = NewOutRec;
         }
      }
   }
   
   private FixupFirstLefts2(innerOutRec : OutRec, outerOutRec : OutRec) : void {
      let orfl : OutRec = outerOutRec.FirstLeft;
      for (let outRec of this.m_PolyOuts) {
         if (outRec.Pts === null || outRec === outerOutRec || outRec === innerOutRec) continue;
         let firstLeft : OutRec = Clipper.ParseFirstLeft(outRec.FirstLeft);
         if (firstLeft !== orfl && firstLeft !== innerOutRec && firstLeft !== outerOutRec) continue;
         if (Clipper.Poly2ContainsPoly1(outRec.Pts, innerOutRec.Pts)) outRec.FirstLeft = innerOutRec;
         else if (Clipper.Poly2ContainsPoly1(outRec.Pts, outerOutRec.Pts)) outRec.FirstLeft = outerOutRec;
         else if (outRec.FirstLeft === innerOutRec || outRec.FirstLeft === outerOutRec) outRec.FirstLeft = orfl;
      }
   }
   
   private FixupFirstLefts3(OldOutRec : OutRec, NewOutRec : OutRec) : void {
      for (let outRec of this.m_PolyOuts) {
         let firstLeft : OutRec = Clipper.ParseFirstLeft(outRec.FirstLeft);
         if (outRec.Pts !== null && firstLeft === OldOutRec) outRec.FirstLeft = NewOutRec;
      }
   }
   
   private static ParseFirstLeft(FirstLeft : OutRec) : OutRec {
      while (FirstLeft !== null && FirstLeft.Pts === null) FirstLeft = FirstLeft.FirstLeft;
      return FirstLeft;
   }
   
   private JoinCommonEdges() : void {
      for (let i : number = 0; i < this.m_Joins.length; i++) {
         let join : Join = this.m_Joins[i];
         let outRec1 : OutRec = this.GetOutRec(join.OutPt1.Idx);
         let outRec2 : OutRec = this.GetOutRec(join.OutPt2.Idx);
         if (outRec1.Pts === null || outRec2.Pts === null) continue;
         if (outRec1.IsOpen || outRec2.IsOpen) continue;
         let holeStateRec : OutRec = null;
         if (outRec1 === outRec2) holeStateRec = outRec1;
         else if (this.OutRec1RightOfOutRec2(outRec1, outRec2)) holeStateRec = outRec2;
         else if (this.OutRec1RightOfOutRec2(outRec2, outRec1)) holeStateRec = outRec1;
         else holeStateRec = this.GetLowermostRec(outRec1, outRec2);
         if (!this.JoinPoints(join, outRec1, outRec2)) continue;
         if (outRec1 === outRec2) {
            outRec1.Pts = join.OutPt1;
            outRec1.BottomPt = null;
            outRec2 = this.CreateOutRec();
            outRec2.Pts = join.OutPt2;
            this.UpdateOutPtIdxs(outRec2);
            if (Clipper.Poly2ContainsPoly1(outRec2.Pts, outRec1.Pts)) {
               outRec2.IsHole = SharpJsHelpers.valueClone(!outRec1.IsHole);
               outRec2.FirstLeft = outRec1;
               if (this.m_UsingPolyTree) this.FixupFirstLefts2(outRec2, outRec1);
               if ((SharpJsHelpers.booleanXor(outRec2.IsHole, this.ReverseSolution)) === (this.Area(outRec2) > 0)) this.ReversePolyPtLinks(outRec2.Pts);
            }
            else if (Clipper.Poly2ContainsPoly1(outRec1.Pts, outRec2.Pts)) {
               outRec2.IsHole = SharpJsHelpers.valueClone(outRec1.IsHole);
               outRec1.IsHole = SharpJsHelpers.valueClone(!outRec2.IsHole);
               outRec2.FirstLeft = outRec1.FirstLeft;
               outRec1.FirstLeft = outRec2;
               if (this.m_UsingPolyTree) this.FixupFirstLefts2(outRec1, outRec2);
               if ((SharpJsHelpers.booleanXor(outRec1.IsHole, this.ReverseSolution)) === (this.Area(outRec1) > 0)) this.ReversePolyPtLinks(outRec1.Pts);
            }
            else {
               outRec2.IsHole = SharpJsHelpers.valueClone(outRec1.IsHole);
               outRec2.FirstLeft = outRec1.FirstLeft;
               if (this.m_UsingPolyTree) this.FixupFirstLefts1(outRec1, outRec2);
            }
         }
         else {
            outRec2.Pts = null;
            outRec2.BottomPt = null;
            outRec2.Idx = SharpJsHelpers.valueClone(outRec1.Idx);
            outRec1.IsHole = SharpJsHelpers.valueClone(holeStateRec.IsHole);
            if (holeStateRec === outRec2) outRec1.FirstLeft = outRec2.FirstLeft;
            outRec2.FirstLeft = outRec1;
            if (this.m_UsingPolyTree) this.FixupFirstLefts3(outRec2, outRec1);
         }
      }
   }
   
   private UpdateOutPtIdxs(outrec : OutRec) : void {
      let op : OutPt = outrec.Pts;
      do {{
         op.Idx = SharpJsHelpers.valueClone(outrec.Idx);
         op = op.Prev;
      }
      } while(op !== outrec.Pts);}
   
   private DoSimplePolygons() : void {
      let i : number = 0;
      while (i < this.m_PolyOuts.length) {
         let outrec : OutRec = this.m_PolyOuts[i++];
         let op : OutPt = outrec.Pts;
         if (op === null || outrec.IsOpen) continue;
         do {{
            let op2 : OutPt = op.Next;
            while (op2 !== outrec.Pts) {
               if ((SharpJsHelpers.tryBinaryOperator(op.Pt, op2.Pt, 'opEquals', (a, b) => a == b)) && op2.Next !== op && op2.Prev !== op) {
                  let op3 : OutPt = op.Prev;
                  let op4 : OutPt = op2.Prev;
                  op.Prev = op4;
                  op4.Next = op;
                  op2.Prev = op3;
                  op3.Next = op2;
                  outrec.Pts = op;
                  let outrec2 : OutRec = this.CreateOutRec();
                  outrec2.Pts = op2;
                  this.UpdateOutPtIdxs(outrec2);
                  if (Clipper.Poly2ContainsPoly1(outrec2.Pts, outrec.Pts)) {
                     outrec2.IsHole = SharpJsHelpers.valueClone(!outrec.IsHole);
                     outrec2.FirstLeft = outrec;
                     if (this.m_UsingPolyTree) this.FixupFirstLefts2(outrec2, outrec);
                  }
                  else if (Clipper.Poly2ContainsPoly1(outrec.Pts, outrec2.Pts)) {
                     outrec2.IsHole = SharpJsHelpers.valueClone(outrec.IsHole);
                     outrec.IsHole = SharpJsHelpers.valueClone(!outrec2.IsHole);
                     outrec2.FirstLeft = outrec.FirstLeft;
                     outrec.FirstLeft = outrec2;
                     if (this.m_UsingPolyTree) this.FixupFirstLefts2(outrec, outrec2);
                  }
                  else {
                     outrec2.IsHole = SharpJsHelpers.valueClone(outrec.IsHole);
                     outrec2.FirstLeft = outrec.FirstLeft;
                     if (this.m_UsingPolyTree) this.FixupFirstLefts1(outrec, outrec2);
                  }
                  op2 = op;
               }
               op2 = op2.Next;
            }
            op = op.Next;
         }
         } while(op !== outrec.Pts);}
   }
   
   public static Area_SharpJs_Overload_0(poly : Array<IntPoint>) : number {
      let cnt : number = <number>poly.length;
      if (cnt < 3) return 0;
      let a : number = 0;
      for (let i : number = 0, j : number = cnt - 1; i < cnt; ++i) {
         a += SharpJsHelpers.valueClone((<number>poly[j].X + poly[i].X) * (<number>poly[j].Y - poly[i].Y));
         j = SharpJsHelpers.valueClone(i);
      }
      return -a * 0.5;
   }
   
   public static Area(poly : Array<IntPoint>) : number;
   public static Area(...args: any[]): number {
      if (args.length == 1 && SharpJsHelpers.TestTypeCheck(args[0], Array)) return Clipper.Area_SharpJs_Overload_0(<Array<IntPoint>>args[0]);
      throw new Error('SharpJS: Failed to match method overload. This can be due to differences in C#/JS type system.');
   }
   
   public Area_SharpJs_Overload_0(outRec : OutRec) : number {
      return this.Area(outRec.Pts);
   }
   
   public Area_SharpJs_Overload_1(op : OutPt) : number {
      let opFirst : OutPt = op;
      if (op === null) return 0;
      let a : number = 0;
      do {{
         a = SharpJsHelpers.valueClone(a + <number>(op.Prev.Pt.X + op.Pt.X) * <number>(op.Prev.Pt.Y - op.Pt.Y));
         op = op.Next;
      }
      } while(op !== opFirst);return a * 0.5;
   }
   
   public Area(outRec : OutRec) : number;
   public Area(op : OutPt) : number;
   public Area(...args: any[]): number | number {
      if (args.length == 1 && SharpJsHelpers.TestTypeCheck(args[0], OutRec)) return this.Area_SharpJs_Overload_0(<OutRec>args[0]);
      else if (args.length == 1 && SharpJsHelpers.TestTypeCheck(args[0], OutPt)) return this.Area_SharpJs_Overload_1(<OutPt>args[0]);
      throw new Error('SharpJS: Failed to match method overload. This can be due to differences in C#/JS type system.');
   }
   
   public static SimplifyPolygon(poly : Array<IntPoint>, fillType : PolyFillType = PolyFillType.pftEvenOdd) : Array<Array<IntPoint>> {
      let result : Array<Array<IntPoint>> = new Array<Array<IntPoint>>();
      let c : Clipper = new Clipper();
      c.StrictlySimple = SharpJsHelpers.valueClone(true);
      c.AddPath(poly, PolyType.ptSubject, true);
      c.Execute(ClipType.ctUnion, result, fillType, fillType);
      return result;
   }
   
   public static SimplifyPolygons(polys : Array<Array<IntPoint>>, fillType : PolyFillType = PolyFillType.pftEvenOdd) : Array<Array<IntPoint>> {
      let result : Array<Array<IntPoint>> = new Array<Array<IntPoint>>();
      let c : Clipper = new Clipper();
      c.StrictlySimple = SharpJsHelpers.valueClone(true);
      c.AddPaths(polys, PolyType.ptSubject, true);
      c.Execute(ClipType.ctUnion, result, fillType, fillType);
      return result;
   }
   
   private static DistanceSqrd(pt1 : IntPoint, pt2 : IntPoint) : number {
      let dx : number = (<number>pt1.X - pt2.X);
      let dy : number = (<number>pt1.Y - pt2.Y);
      return (dx * dx + dy * dy);
   }
   
   private static DistanceFromLineSqrd(pt : IntPoint, ln1 : IntPoint, ln2 : IntPoint) : number {
      let A : number = ln1.Y - ln2.Y;
      let B : number = ln2.X - ln1.X;
      let C : number = A * ln1.X + B * ln1.Y;
      C = SharpJsHelpers.valueClone(A * pt.X + B * pt.Y - C);
      return (C * C) / (A * A + B * B);
   }
   
   private static SlopesNearCollinear(pt1 : IntPoint, pt2 : IntPoint, pt3 : IntPoint, distSqrd : number) : boolean {
      if (Math.abs(pt1.X - pt2.X) > Math.abs(pt1.Y - pt2.Y)) {
         if ((pt1.X > pt2.X) === (pt1.X < pt3.X)) return Clipper.DistanceFromLineSqrd(pt1, pt2, pt3) < distSqrd;
         else if ((pt2.X > pt1.X) === (pt2.X < pt3.X)) return Clipper.DistanceFromLineSqrd(pt2, pt1, pt3) < distSqrd;
         else return Clipper.DistanceFromLineSqrd(pt3, pt1, pt2) < distSqrd;
      }
      else {
         if ((pt1.Y > pt2.Y) === (pt1.Y < pt3.Y)) return Clipper.DistanceFromLineSqrd(pt1, pt2, pt3) < distSqrd;
         else if ((pt2.Y > pt1.Y) === (pt2.Y < pt3.Y)) return Clipper.DistanceFromLineSqrd(pt2, pt1, pt3) < distSqrd;
         else return Clipper.DistanceFromLineSqrd(pt3, pt1, pt2) < distSqrd;
      }
   }
   
   private static PointsAreClose(pt1 : IntPoint, pt2 : IntPoint, distSqrd : number) : boolean {
      let dx : number = <number>pt1.X - pt2.X;
      let dy : number = <number>pt1.Y - pt2.Y;
      return ((dx * dx) + (dy * dy) <= distSqrd);
   }
   
   private static ExcludeOp(op : OutPt) : OutPt {
      let result : OutPt = op.Prev;
      result.Next = op.Next;
      op.Next.Prev = result;
      result.Idx = SharpJsHelpers.valueClone(0);
      return result;
   }
   
   public static CleanPolygon(path : Array<IntPoint>, distance : number = 1.415) : Array<IntPoint> {
      let cnt : number = path.length;
      if (cnt === 0) return new Array<IntPoint>();
      let outPts : OutPt[] = new Array<OutPt>(cnt);
      for (let i : number = 0; i < cnt; ++i) outPts[i] = new OutPt();
      for (let i : number = 0; i < cnt; ++i) {
         outPts[i].Pt = SharpJsHelpers.valueClone(path[i]);
         outPts[i].Next = outPts[(i + 1) % cnt];
         outPts[i].Next.Prev = outPts[i];
         outPts[i].Idx = SharpJsHelpers.valueClone(0);
      }
      let distSqrd : number = distance * distance;
      let op : OutPt = outPts[0];
      while (op.Idx === 0 && op.Next !== op.Prev) {
         if (Clipper.PointsAreClose(op.Pt, op.Prev.Pt, distSqrd)) {
            op = Clipper.ExcludeOp(op);
            cnt--;
         }
         else if (Clipper.PointsAreClose(op.Prev.Pt, op.Next.Pt, distSqrd)) {
            Clipper.ExcludeOp(op.Next);
            op = Clipper.ExcludeOp(op);
            cnt -= SharpJsHelpers.valueClone(2);
         }
         else if (Clipper.SlopesNearCollinear(op.Prev.Pt, op.Pt, op.Next.Pt, distSqrd)) {
            op = Clipper.ExcludeOp(op);
            cnt--;
         }
         else {
            op.Idx = SharpJsHelpers.valueClone(1);
            op = op.Next;
         }
      }
      if (cnt < 3) cnt = SharpJsHelpers.valueClone(0);
      let result : Array<IntPoint> = new Array<IntPoint>();
      for (let i : number = 0; i < cnt; ++i) {
         result.push(op.Pt);
         op = op.Next;
      }
      outPts = null;
      return result;
   }
   
   public static CleanPolygons(polys : Array<Array<IntPoint>>, distance : number = 1.415) : Array<Array<IntPoint>> {
      let result : Array<Array<IntPoint>> = new Array<Array<IntPoint>>();
      for (let i : number = 0; i < polys.length; i++) result.push(Clipper.CleanPolygon(polys[i], distance));
      return result;
   }
   
   public static Minkowski(pattern : Array<IntPoint>, path : Array<IntPoint>, IsSum : boolean, IsClosed : boolean) : Array<Array<IntPoint>> {
      let delta : number = (IsClosed ? 1 : 0);
      let polyCnt : number = pattern.length;
      let pathCnt : number = path.length;
      let result : Array<Array<IntPoint>> = new Array<Array<IntPoint>>();
      if (IsSum) for (let i : number = 0; i < pathCnt; i++) {
         let p : Array<IntPoint> = new Array<IntPoint>();
         for (let ip of pattern) p.push(new IntPoint(path[i].X + ip.X, path[i].Y + ip.Y));
         result.push(p);
      }
      else for (let i : number = 0; i < pathCnt; i++) {
         let p : Array<IntPoint> = new Array<IntPoint>();
         for (let ip of pattern) p.push(new IntPoint(path[i].X - ip.X, path[i].Y - ip.Y));
         result.push(p);
      }
      let quads : Array<Array<IntPoint>> = new Array<Array<IntPoint>>();
      for (let i : number = 0; i < pathCnt - 1 + delta; i++) for (let j : number = 0; j < polyCnt; j++) {
         let quad : Array<IntPoint> = new Array<IntPoint>();
         quad.push(result[i % pathCnt][j % polyCnt]);
         quad.push(result[(i + 1) % pathCnt][j % polyCnt]);
         quad.push(result[(i + 1) % pathCnt][(j + 1) % polyCnt]);
         quad.push(result[i % pathCnt][(j + 1) % polyCnt]);
         if (!Clipper.Orientation(quad)) quad.reverse();
         quads.push(quad);
      }
      return quads;
   }
   
   public static MinkowskiSum_SharpJs_Overload_0(pattern : Array<IntPoint>, path : Array<IntPoint>, pathIsClosed : boolean) : Array<Array<IntPoint>> {
      let paths : Array<Array<IntPoint>> = Clipper.Minkowski(pattern, path, true, pathIsClosed);
      let c : Clipper = new Clipper();
      c.AddPaths(paths, PolyType.ptSubject, true);
      c.Execute(ClipType.ctUnion, paths, PolyFillType.pftNonZero, PolyFillType.pftNonZero);
      return paths;
   }
   
   public static MinkowskiSum_SharpJs_Overload_1(pattern : Array<IntPoint>, paths : Array<Array<IntPoint>>, pathIsClosed : boolean) : Array<Array<IntPoint>> {
      let solution : Array<Array<IntPoint>> = new Array<Array<IntPoint>>();
      let c : Clipper = new Clipper();
      for (let i : number = 0; i < paths.length; ++i) {
         let tmp : Array<Array<IntPoint>> = Clipper.Minkowski(pattern, paths[i], true, pathIsClosed);
         c.AddPaths(tmp, PolyType.ptSubject, true);
         if (pathIsClosed) {
            let path : Array<IntPoint> = Clipper.TranslatePath(paths[i], pattern[0]);
            c.AddPath(path, PolyType.ptClip, true);
         }
      }
      c.Execute(ClipType.ctUnion, solution, PolyFillType.pftNonZero, PolyFillType.pftNonZero);
      return solution;
   }
   
   public static MinkowskiSum(pattern : Array<IntPoint>, path : Array<IntPoint>, pathIsClosed : boolean) : Array<Array<IntPoint>>;
   public static MinkowskiSum(pattern : Array<IntPoint>, paths : Array<Array<IntPoint>>, pathIsClosed : boolean) : Array<Array<IntPoint>>;
   public static MinkowskiSum(...args: any[]): Array<Array<IntPoint>> | Array<Array<IntPoint>> {
      if (args.length == 3 && SharpJsHelpers.TestTypeCheck(args[0], Array) && SharpJsHelpers.TestTypeCheck(args[1], Array) && SharpJsHelpers.TestTypeCheck(args[2], 'boolean')) return Clipper.MinkowskiSum_SharpJs_Overload_0(<Array<IntPoint>>args[0], <Array<IntPoint>>args[1], <boolean>args[2]);
      else if (args.length == 3 && SharpJsHelpers.TestTypeCheck(args[0], Array) && SharpJsHelpers.TestTypeCheck(args[1], Array) && SharpJsHelpers.TestTypeCheck(args[2], 'boolean')) return Clipper.MinkowskiSum_SharpJs_Overload_1(<Array<IntPoint>>args[0], <Array<Array<IntPoint>>>args[1], <boolean>args[2]);
      throw new Error('SharpJS: Failed to match method overload. This can be due to differences in C#/JS type system.');
   }
   
   private static TranslatePath(path : Array<IntPoint>, delta : IntPoint) : Array<IntPoint> {
      let outPath : Array<IntPoint> = new Array<IntPoint>();
      for (let i : number = 0; i < path.length; i++) outPath.push(new IntPoint(path[i].X + delta.X, path[i].Y + delta.Y));
      return outPath;
   }
   
   public static MinkowskiDiff(poly1 : Array<IntPoint>, poly2 : Array<IntPoint>) : Array<Array<IntPoint>> {
      let paths : Array<Array<IntPoint>> = Clipper.Minkowski(poly1, poly2, false, true);
      let c : Clipper = new Clipper();
      c.AddPaths(paths, PolyType.ptSubject, true);
      c.Execute(ClipType.ctUnion, paths, PolyFillType.pftNonZero, PolyFillType.pftNonZero);
      return paths;
   }
   
   public static PolyTreeToPaths(polytree : PolyTree) : Array<Array<IntPoint>> {
      let result : Array<Array<IntPoint>> = new Array<Array<IntPoint>>();
      SharpJsHelpers.setCapacity(result, polytree.Total);
      Clipper.AddPolyNodeToPaths(polytree, NodeType.ntAny, result);
      return result;
   }
   
   public static AddPolyNodeToPaths(polynode : PolyNode, nt : NodeType, paths : Array<Array<IntPoint>>) : void {
      let match : boolean = true;
      switch (nt) {
         case NodeType.ntOpen: {
            return;
         }
         case NodeType.ntClosed: {
            match = SharpJsHelpers.valueClone(!polynode.IsOpen);
            break;
         }
         default: {
            break;
         }
      }
      if (polynode.m_polygon.length > 0 && match) paths.push(polynode.m_polygon);
      for (let pn of polynode.Childs) Clipper.AddPolyNodeToPaths(pn, nt, paths);
   }
   
   public static OpenPathsFromPolyTree(polytree : PolyTree) : Array<Array<IntPoint>> {
      let result : Array<Array<IntPoint>> = new Array<Array<IntPoint>>();
      SharpJsHelpers.setCapacity(result, polytree.ChildCount);
      for (let i : number = 0; i < polytree.ChildCount; i++) if (polytree.Childs[i].IsOpen) result.push(polytree.Childs[i].m_polygon);
      return result;
   }
   
   public static ClosedPathsFromPolyTree(polytree : PolyTree) : Array<Array<IntPoint>> {
      let result : Array<Array<IntPoint>> = new Array<Array<IntPoint>>();
      SharpJsHelpers.setCapacity(result, polytree.Total);
      Clipper.AddPolyNodeToPaths(polytree, NodeType.ntClosed, result);
      return result;
   }
   
}

export class ClipperOffset {
   private m_destPolys : Array<Array<IntPoint>> = null;
   private m_srcPoly : Array<IntPoint> = null;
   private m_destPoly : Array<IntPoint> = null;
   private m_normals : Array<DoublePoint> = new Array<DoublePoint>();
   private m_delta : number = 0;
   private m_sinA : number = 0;
   private m_sin : number = 0;
   private m_cos : number = 0;
   private m_miterLim : number = 0;
   private m_StepsPerRad : number = 0;
   private m_lowest : IntPoint = IntPoint.default();
   private m_polyNodes : PolyNode = new PolyNode();
   private static readonly two_pi : number = Math.PI * 2;
   private static readonly def_arc_tolerance : number = 0.25;
   
   public constructor_SharpJs_Overload_0(miterLimit : number = 2.0, arcTolerance : number = ClipperOffset.def_arc_tolerance) {
      this.MiterLimit = SharpJsHelpers.valueClone(miterLimit);
      this.ArcTolerance = SharpJsHelpers.valueClone(arcTolerance);
      this.m_lowest.X = SharpJsHelpers.valueClone(-1);
   }
   
   public constructor();
   public constructor(miterLimit : number);
   public constructor(miterLimit : number, arcTolerance : number);
   public constructor(...args: any[]) {
      if (args.length == 0) { this.constructor_SharpJs_Overload_0(<number>2.0, <number>ClipperOffset.def_arc_tolerance); return; }
      else if (args.length == 1 && SharpJsHelpers.TestTypeCheck(args[0], 'number')) { this.constructor_SharpJs_Overload_0(<number>args[0], <number>ClipperOffset.def_arc_tolerance); return; }
      else if (args.length == 2 && SharpJsHelpers.TestTypeCheck(args[0], 'number') && SharpJsHelpers.TestTypeCheck(args[1], 'number')) { this.constructor_SharpJs_Overload_0(<number>args[0], <number>args[1]); return; }
      throw new Error('SharpJS: Failed to match method overload. This can be due to differences in C#/JS type system.');
   }
   
   private m_ArcTolerance : number = 0;
   get ArcTolerance(): number { return this.m_ArcTolerance; }
   set ArcTolerance(value: number) { this.m_ArcTolerance = SharpJsHelpers.valueClone(value); }
   private m_MiterLimit : number = 0;
   get MiterLimit(): number { return this.m_MiterLimit; }
   set MiterLimit(value: number) { this.m_MiterLimit = SharpJsHelpers.valueClone(value); }
   public Clear() : void {
      SharpJsHelpers.arrayClear(this.m_polyNodes.Childs);
      this.m_lowest.X = SharpJsHelpers.valueClone(-1);
   }
   
   public static Round(value : number) : number {
      return value < 0 ? <number>(value - 0.5) : <number>(value + 0.5);
   }
   
   public AddPath(path : Array<IntPoint>, joinType : JoinType, endType : EndType) : void {
      let highI : number = path.length - 1;
      if (highI < 0) return;
      let newNode : PolyNode = new PolyNode();
      newNode.m_jointype = SharpJsHelpers.valueClone(joinType);
      newNode.m_endtype = SharpJsHelpers.valueClone(endType);
      if (endType === EndType.etClosedLine || endType === EndType.etClosedPolygon) while (highI > 0 && SharpJsHelpers.tryBinaryOperator(path[0], path[highI], 'opEquals', (a, b) => a == b)) highI--;
      SharpJsHelpers.setCapacity(newNode.m_polygon, highI + 1);
      newNode.m_polygon.push(path[0]);
      let j : number = 0, k : number = 0;
      for (let i : number = 1; i <= highI; i++) if (SharpJsHelpers.tryBinaryOperator(newNode.m_polygon[j], path[i], 'opNotEquals', (a, b) => a != b)) {
         j++;
         newNode.m_polygon.push(path[i]);
         if (path[i].Y > newNode.m_polygon[k].Y || (path[i].Y === newNode.m_polygon[k].Y && path[i].X < newNode.m_polygon[k].X)) k = SharpJsHelpers.valueClone(j);
      }
      if (endType === EndType.etClosedPolygon && j < 2) return;
      this.m_polyNodes.AddChild(newNode);
      if (endType !== EndType.etClosedPolygon) return;
      if (this.m_lowest.X < 0) this.m_lowest = SharpJsHelpers.valueClone(new IntPoint(this.m_polyNodes.ChildCount - 1, k));
      else {
         let ip : IntPoint = this.m_polyNodes.Childs[<number>this.m_lowest.X].m_polygon[<number>this.m_lowest.Y];
         if (newNode.m_polygon[k].Y > ip.Y || (newNode.m_polygon[k].Y === ip.Y && newNode.m_polygon[k].X < ip.X)) this.m_lowest = SharpJsHelpers.valueClone(new IntPoint(this.m_polyNodes.ChildCount - 1, k));
      }
   }
   
   public AddPaths(paths : Array<Array<IntPoint>>, joinType : JoinType, endType : EndType) : void {
      for (let p of paths) this.AddPath(p, joinType, endType);
   }
   
   private FixOrientations() : void {
      if (this.m_lowest.X >= 0 && !Clipper.Orientation(this.m_polyNodes.Childs[<number>this.m_lowest.X].m_polygon)) {
         for (let i : number = 0; i < this.m_polyNodes.ChildCount; i++) {
            let node : PolyNode = this.m_polyNodes.Childs[i];
            if (node.m_endtype === EndType.etClosedPolygon || (node.m_endtype === EndType.etClosedLine && Clipper.Orientation(node.m_polygon))) node.m_polygon.reverse();
         }
      }
      else {
         for (let i : number = 0; i < this.m_polyNodes.ChildCount; i++) {
            let node : PolyNode = this.m_polyNodes.Childs[i];
            if (node.m_endtype === EndType.etClosedLine && !Clipper.Orientation(node.m_polygon)) node.m_polygon.reverse();
         }
      }
   }
   
   public static GetUnitNormal(pt1 : IntPoint, pt2 : IntPoint) : DoublePoint {
      let dx : number = (pt2.X - pt1.X);
      let dy : number = (pt2.Y - pt1.Y);
      if ((dx === 0) && (dy === 0)) return new DoublePoint();
      let f : number = 1 * 1.0 / Math.sqrt(dx * dx + dy * dy);
      dx *= SharpJsHelpers.valueClone(f);
      dy *= SharpJsHelpers.valueClone(f);
      return new DoublePoint(dy, -dx);
   }
   
   private DoOffset(delta : number) : void {
      this.m_destPolys = new Array<Array<IntPoint>>();
      this.m_delta = SharpJsHelpers.valueClone(delta);
      if (ClipperBase.near_zero(delta)) {
         SharpJsHelpers.setCapacity(this.m_destPolys, this.m_polyNodes.ChildCount);
         for (let i : number = 0; i < this.m_polyNodes.ChildCount; i++) {
            let node : PolyNode = this.m_polyNodes.Childs[i];
            if (node.m_endtype === EndType.etClosedPolygon) this.m_destPolys.push(node.m_polygon);
         }
         return;
      }
      if (this.MiterLimit > 2) this.m_miterLim = SharpJsHelpers.valueClone(2 / (this.MiterLimit * this.MiterLimit));
      else this.m_miterLim = SharpJsHelpers.valueClone(0.5);
      let y : number = 0;
      if (this.ArcTolerance <= 0.0) y = SharpJsHelpers.valueClone(ClipperOffset.def_arc_tolerance);
      else if (this.ArcTolerance > Math.abs(delta) * ClipperOffset.def_arc_tolerance) y = SharpJsHelpers.valueClone(Math.abs(delta) * ClipperOffset.def_arc_tolerance);
      else y = SharpJsHelpers.valueClone(this.ArcTolerance);
      let steps : number = Math.PI / Math.acos(1 - y / Math.abs(delta));
      this.m_sin = SharpJsHelpers.valueClone(Math.sin(ClipperOffset.two_pi / steps));
      this.m_cos = SharpJsHelpers.valueClone(Math.cos(ClipperOffset.two_pi / steps));
      this.m_StepsPerRad = SharpJsHelpers.valueClone(steps / ClipperOffset.two_pi);
      if (delta < 0.0) this.m_sin = SharpJsHelpers.valueClone(-this.m_sin);
      SharpJsHelpers.setCapacity(this.m_destPolys, this.m_polyNodes.ChildCount * 2);
      for (let i : number = 0; i < this.m_polyNodes.ChildCount; i++) {
         let node : PolyNode = this.m_polyNodes.Childs[i];
         this.m_srcPoly = node.m_polygon;
         let len : number = this.m_srcPoly.length;
         if (len === 0 || (delta <= 0 && (len < 3 || node.m_endtype !== EndType.etClosedPolygon))) continue;
         this.m_destPoly = new Array<IntPoint>();
         if (len === 1) {
            if (node.m_jointype === JoinType.jtRound) {
               let X : number = 1.0, Y : number = 0.0;
               for (let j : number = 1; j <= steps; j++) {
                  this.m_destPoly.push(new IntPoint(ClipperOffset.Round(this.m_srcPoly[0].X + X * delta), ClipperOffset.Round(this.m_srcPoly[0].Y + Y * delta)));
                  let X2 : number = X;
                  X = SharpJsHelpers.valueClone(X * this.m_cos - this.m_sin * Y);
                  Y = SharpJsHelpers.valueClone(X2 * this.m_sin + Y * this.m_cos);
               }
            }
            else {
               let X : number = -1.0, Y : number = -1.0;
               for (let j : number = 0; j < 4; ++j) {
                  this.m_destPoly.push(new IntPoint(ClipperOffset.Round(this.m_srcPoly[0].X + X * delta), ClipperOffset.Round(this.m_srcPoly[0].Y + Y * delta)));
                  if (X < 0) X = SharpJsHelpers.valueClone(1);
                  else if (Y < 0) Y = SharpJsHelpers.valueClone(1);
                  else X = SharpJsHelpers.valueClone(-1);
               }
            }
            this.m_destPolys.push(this.m_destPoly);
            continue;
         }
         SharpJsHelpers.arrayClear(this.m_normals);
         SharpJsHelpers.setCapacity(this.m_normals, len);
         for (let j : number = 0; j < len - 1; j++) this.m_normals.push(ClipperOffset.GetUnitNormal(this.m_srcPoly[j], this.m_srcPoly[j + 1]));
         if (node.m_endtype === EndType.etClosedLine || node.m_endtype === EndType.etClosedPolygon) this.m_normals.push(ClipperOffset.GetUnitNormal(this.m_srcPoly[len - 1], this.m_srcPoly[0]));
         else this.m_normals.push(new DoublePoint(this.m_normals[len - 2]));
         if (node.m_endtype === EndType.etClosedPolygon) {
            let k : number = len - 1;
            for (let j : number = 0; j < len; j++) this.OffsetPoint(j, createOutRefParam(() => { return SharpJsHelpers.valueClone(k); }, (__value) => { k = __value; return SharpJsHelpers.valueClone(__value); }), node.m_jointype);
            this.m_destPolys.push(this.m_destPoly);
         }
         else if (node.m_endtype === EndType.etClosedLine) {
            let k : number = len - 1;
            for (let j : number = 0; j < len; j++) this.OffsetPoint(j, createOutRefParam(() => { return SharpJsHelpers.valueClone(k); }, (__value) => { k = __value; return SharpJsHelpers.valueClone(__value); }), node.m_jointype);
            this.m_destPolys.push(this.m_destPoly);
            this.m_destPoly = new Array<IntPoint>();
            let n : DoublePoint = this.m_normals[len - 1];
            for (let j : number = len - 1; j > 0; j--) this.m_normals[j] = SharpJsHelpers.valueClone(new DoublePoint(-this.m_normals[j - 1].X, -this.m_normals[j - 1].Y));
            this.m_normals[0] = SharpJsHelpers.valueClone(new DoublePoint(-n.X, -n.Y));
            k = SharpJsHelpers.valueClone(0);
            for (let j : number = len - 1; j >= 0; j--) this.OffsetPoint(j, createOutRefParam(() => { return SharpJsHelpers.valueClone(k); }, (__value) => { k = __value; return SharpJsHelpers.valueClone(__value); }), node.m_jointype);
            this.m_destPolys.push(this.m_destPoly);
         }
         else {
            let k : number = 0;
            for (let j : number = 1; j < len - 1; ++j) this.OffsetPoint(j, createOutRefParam(() => { return SharpJsHelpers.valueClone(k); }, (__value) => { k = __value; return SharpJsHelpers.valueClone(__value); }), node.m_jointype);
            let pt1 : IntPoint = IntPoint.default();
            if (node.m_endtype === EndType.etOpenButt) {
               let j : number = len - 1;
               pt1 = SharpJsHelpers.valueClone(new IntPoint(<number>ClipperOffset.Round(this.m_srcPoly[j].X + this.m_normals[j].X * delta), <number>ClipperOffset.Round(this.m_srcPoly[j].Y + this.m_normals[j].Y * delta)));
               this.m_destPoly.push(pt1);
               pt1 = SharpJsHelpers.valueClone(new IntPoint(<number>ClipperOffset.Round(this.m_srcPoly[j].X - this.m_normals[j].X * delta), <number>ClipperOffset.Round(this.m_srcPoly[j].Y - this.m_normals[j].Y * delta)));
               this.m_destPoly.push(pt1);
            }
            else {
               let j : number = len - 1;
               k = SharpJsHelpers.valueClone(len - 2);
               this.m_sinA = SharpJsHelpers.valueClone(0);
               this.m_normals[j] = SharpJsHelpers.valueClone(new DoublePoint(-this.m_normals[j].X, -this.m_normals[j].Y));
               if (node.m_endtype === EndType.etOpenSquare) this.DoSquare(j, k);
               else this.DoRound(j, k);
            }
            for (let j : number = len - 1; j > 0; j--) this.m_normals[j] = SharpJsHelpers.valueClone(new DoublePoint(-this.m_normals[j - 1].X, -this.m_normals[j - 1].Y));
            this.m_normals[0] = SharpJsHelpers.valueClone(new DoublePoint(-this.m_normals[1].X, -this.m_normals[1].Y));
            k = SharpJsHelpers.valueClone(len - 1);
            for (let j : number = k - 1; j > 0; --j) this.OffsetPoint(j, createOutRefParam(() => { return SharpJsHelpers.valueClone(k); }, (__value) => { k = __value; return SharpJsHelpers.valueClone(__value); }), node.m_jointype);
            if (node.m_endtype === EndType.etOpenButt) {
               pt1 = SharpJsHelpers.valueClone(new IntPoint(<number>ClipperOffset.Round(this.m_srcPoly[0].X - this.m_normals[0].X * delta), <number>ClipperOffset.Round(this.m_srcPoly[0].Y - this.m_normals[0].Y * delta)));
               this.m_destPoly.push(pt1);
               pt1 = SharpJsHelpers.valueClone(new IntPoint(<number>ClipperOffset.Round(this.m_srcPoly[0].X + this.m_normals[0].X * delta), <number>ClipperOffset.Round(this.m_srcPoly[0].Y + this.m_normals[0].Y * delta)));
               this.m_destPoly.push(pt1);
            }
            else {
               k = SharpJsHelpers.valueClone(1);
               this.m_sinA = SharpJsHelpers.valueClone(0);
               if (node.m_endtype === EndType.etOpenSquare) this.DoSquare(0, 1);
               else this.DoRound(0, 1);
            }
            this.m_destPolys.push(this.m_destPoly);
         }
      }
   }
   
   public Execute_SharpJs_Overload_0(solution : OutRefParam<Array<Array<IntPoint>>>, delta : number) : void {
      SharpJsHelpers.arrayClear(solution.read());
      this.FixOrientations();
      this.DoOffset(delta);
      let clpr : Clipper = new Clipper();
      clpr.AddPaths(this.m_destPolys, PolyType.ptSubject, true);
      if (delta > 0) {
         clpr.Execute(ClipType.ctUnion, solution.read(), PolyFillType.pftPositive, PolyFillType.pftPositive);
      }
      else {
         let r : IntRect = ClipperBase.GetBounds(this.m_destPolys);
         let outer : Array<IntPoint> = new Array<IntPoint>();
         outer.push(new IntPoint(r.left - 10, r.bottom + 10));
         outer.push(new IntPoint(r.right + 10, r.bottom + 10));
         outer.push(new IntPoint(r.right + 10, r.top - 10));
         outer.push(new IntPoint(r.left - 10, r.top - 10));
         clpr.AddPath(outer, PolyType.ptSubject, true);
         clpr.ReverseSolution = SharpJsHelpers.valueClone(true);
         clpr.Execute(ClipType.ctUnion, solution.read(), PolyFillType.pftNegative, PolyFillType.pftNegative);
         if (solution.read().length > 0) solution.read().splice(0, 1);
      }
   }
   
   public Execute_SharpJs_Overload_1(solution : OutRefParam<PolyTree>, delta : number) : void {
      solution.read().Clear();
      this.FixOrientations();
      this.DoOffset(delta);
      let clpr : Clipper = new Clipper();
      clpr.AddPaths(this.m_destPolys, PolyType.ptSubject, true);
      if (delta > 0) {
         clpr.Execute(ClipType.ctUnion, solution.read(), PolyFillType.pftPositive, PolyFillType.pftPositive);
      }
      else {
         let r : IntRect = ClipperBase.GetBounds(this.m_destPolys);
         let outer : Array<IntPoint> = new Array<IntPoint>();
         outer.push(new IntPoint(r.left - 10, r.bottom + 10));
         outer.push(new IntPoint(r.right + 10, r.bottom + 10));
         outer.push(new IntPoint(r.right + 10, r.top - 10));
         outer.push(new IntPoint(r.left - 10, r.top - 10));
         clpr.AddPath(outer, PolyType.ptSubject, true);
         clpr.ReverseSolution = SharpJsHelpers.valueClone(true);
         clpr.Execute(ClipType.ctUnion, solution.read(), PolyFillType.pftNegative, PolyFillType.pftNegative);
         if (solution.read().ChildCount === 1 && solution.read().Childs[0].ChildCount > 0) {
            let outerNode : PolyNode = solution.read().Childs[0];
            SharpJsHelpers.setCapacity(solution.read().Childs, outerNode.ChildCount);
            solution.read().Childs[0] = outerNode.Childs[0];
            solution.read().Childs[0].m_Parent = solution.read();
            for (let i : number = 1; i < outerNode.ChildCount; i++) solution.read().AddChild(outerNode.Childs[i]);
         }
         else solution.read().Clear();
      }
   }
   
   public Execute(solution : OutRefParam<Array<Array<IntPoint>>>, delta : number) : void;
   public Execute(solution : OutRefParam<PolyTree>, delta : number) : void;
   public Execute(...args: any[]): void | void {
      if (args.length == 2 && SharpJsHelpers.TestTypeCheck(args[0], OutRefParam) && SharpJsHelpers.TestTypeCheck(args[1], 'number')) return this.Execute_SharpJs_Overload_0(<OutRefParam<Array<Array<IntPoint>>>>args[0], <number>args[1]);
      else if (args.length == 2 && SharpJsHelpers.TestTypeCheck(args[0], OutRefParam) && SharpJsHelpers.TestTypeCheck(args[1], 'number')) return this.Execute_SharpJs_Overload_1(<OutRefParam<PolyTree>>args[0], <number>args[1]);
      throw new Error('SharpJS: Failed to match method overload. This can be due to differences in C#/JS type system.');
   }
   
   OffsetPoint(j : number, k : OutRefParam<number>, jointype : JoinType) : void {
      this.m_sinA = SharpJsHelpers.valueClone((this.m_normals[k.read()].X * this.m_normals[j].Y - this.m_normals[j].X * this.m_normals[k.read()].Y));
      if (Math.abs(this.m_sinA * this.m_delta) < 1.0) {
         let cosA : number = (this.m_normals[k.read()].X * this.m_normals[j].X + this.m_normals[j].Y * this.m_normals[k.read()].Y);
         if (cosA > 0) {
            this.m_destPoly.push(new IntPoint(ClipperOffset.Round(this.m_srcPoly[j].X + this.m_normals[k.read()].X * this.m_delta), ClipperOffset.Round(this.m_srcPoly[j].Y + this.m_normals[k.read()].Y * this.m_delta)));
            return;
         }
      }
      else if (this.m_sinA > 1.0) this.m_sinA = SharpJsHelpers.valueClone(1.0);
      else if (this.m_sinA < -1.0) this.m_sinA = SharpJsHelpers.valueClone(-1.0);
      if (this.m_sinA * this.m_delta < 0) {
         this.m_destPoly.push(new IntPoint(ClipperOffset.Round(this.m_srcPoly[j].X + this.m_normals[k.read()].X * this.m_delta), ClipperOffset.Round(this.m_srcPoly[j].Y + this.m_normals[k.read()].Y * this.m_delta)));
         this.m_destPoly.push(this.m_srcPoly[j]);
         this.m_destPoly.push(new IntPoint(ClipperOffset.Round(this.m_srcPoly[j].X + this.m_normals[j].X * this.m_delta), ClipperOffset.Round(this.m_srcPoly[j].Y + this.m_normals[j].Y * this.m_delta)));
      }
      else switch (jointype) {
         case JoinType.jtMiter: {
            let r : number = 1 + (this.m_normals[j].X * this.m_normals[k.read()].X + this.m_normals[j].Y * this.m_normals[k.read()].Y);
            if (r >= this.m_miterLim) this.DoMiter(j, k.read(), r);
            else this.DoSquare(j, k.read());
            break;
         }
         case JoinType.jtSquare: {
            this.DoSquare(j, k.read());
            break;
         }
         case JoinType.jtRound: {
            this.DoRound(j, k.read());
            break;
         }
      }
      k.write(SharpJsHelpers.valueClone(j));
   }
   
   public DoSquare(j : number, k : number) : void {
      let dx : number = Math.tan(Math.atan2(this.m_sinA, this.m_normals[k].X * this.m_normals[j].X + this.m_normals[k].Y * this.m_normals[j].Y) / 4);
      this.m_destPoly.push(new IntPoint(ClipperOffset.Round(this.m_srcPoly[j].X + this.m_delta * (this.m_normals[k].X - this.m_normals[k].Y * dx)), ClipperOffset.Round(this.m_srcPoly[j].Y + this.m_delta * (this.m_normals[k].Y + this.m_normals[k].X * dx))));
      this.m_destPoly.push(new IntPoint(ClipperOffset.Round(this.m_srcPoly[j].X + this.m_delta * (this.m_normals[j].X + this.m_normals[j].Y * dx)), ClipperOffset.Round(this.m_srcPoly[j].Y + this.m_delta * (this.m_normals[j].Y - this.m_normals[j].X * dx))));
   }
   
   public DoMiter(j : number, k : number, r : number) : void {
      let q : number = this.m_delta / r;
      this.m_destPoly.push(new IntPoint(ClipperOffset.Round(this.m_srcPoly[j].X + (this.m_normals[k].X + this.m_normals[j].X) * q), ClipperOffset.Round(this.m_srcPoly[j].Y + (this.m_normals[k].Y + this.m_normals[j].Y) * q)));
   }
   
   public DoRound(j : number, k : number) : void {
      let a : number = Math.atan2(this.m_sinA, this.m_normals[k].X * this.m_normals[j].X + this.m_normals[k].Y * this.m_normals[j].Y);
      let steps : number = Math.max(<number>ClipperOffset.Round(this.m_StepsPerRad * Math.abs(a)), 1);
      let X : number = this.m_normals[k].X, Y : number = this.m_normals[k].Y, X2 : number = 0;
      for (let i : number = 0; i < steps; ++i) {
         this.m_destPoly.push(new IntPoint(ClipperOffset.Round(this.m_srcPoly[j].X + X * this.m_delta), ClipperOffset.Round(this.m_srcPoly[j].Y + Y * this.m_delta)));
         X2 = SharpJsHelpers.valueClone(X);
         X = SharpJsHelpers.valueClone(X * this.m_cos - this.m_sin * Y);
         Y = SharpJsHelpers.valueClone(X2 * this.m_sin + Y * this.m_cos);
      }
      this.m_destPoly.push(new IntPoint(ClipperOffset.Round(this.m_srcPoly[j].X + this.m_normals[j].X * this.m_delta), ClipperOffset.Round(this.m_srcPoly[j].Y + this.m_normals[j].Y * this.m_delta)));
   }
   
}

export class ClipperException extends Error {
   public constructor_SharpJs_Overload_0(description : string) { }
   
   public constructor(description : string);
   public constructor(...args: any[]) {
      super();
      if (args.length == 1 && SharpJsHelpers.TestTypeCheck(args[0], 'string')) { this.constructor_SharpJs_Overload_0(<string>args[0]); return; }
      throw new Error('SharpJS: Failed to match method overload. This can be due to differences in C#/JS type system.');
   }
   
}

export class DoublePoint {
   public X : number = 0;
   public Y : number = 0;
   
   public constructor_SharpJs_Overload_0() { }
   
   public constructor_SharpJs_Overload_1(x : number = 0, y : number = 0) {
      this.X = SharpJsHelpers.valueClone(x);
      this.Y = SharpJsHelpers.valueClone(y);
   }
   
   public constructor_SharpJs_Overload_2(dp : DoublePoint) {
      this.X = SharpJsHelpers.valueClone(dp.X);
      this.Y = SharpJsHelpers.valueClone(dp.Y);
   }
   
   public constructor_SharpJs_Overload_3(ip : IntPoint) {
      this.X = SharpJsHelpers.valueClone(ip.X);
      this.Y = SharpJsHelpers.valueClone(ip.Y);
   }
   
   public constructor();
   public constructor();
   public constructor(x : number);
   public constructor(x : number, y : number);
   public constructor(dp : DoublePoint);
   public constructor(ip : IntPoint);
   public constructor(...args: any[]) {
      if (args.length == 0) { this.constructor_SharpJs_Overload_0(); return; }
      else if (args.length == 0) { this.constructor_SharpJs_Overload_1(<number>0, <number>0); return; }
      else if (args.length == 1 && SharpJsHelpers.TestTypeCheck(args[0], 'number')) { this.constructor_SharpJs_Overload_1(<number>args[0], <number>0); return; }
      else if (args.length == 2 && SharpJsHelpers.TestTypeCheck(args[0], 'number') && SharpJsHelpers.TestTypeCheck(args[1], 'number')) { this.constructor_SharpJs_Overload_1(<number>args[0], <number>args[1]); return; }
      else if (args.length == 1 && SharpJsHelpers.TestTypeCheck(args[0], DoublePoint)) { this.constructor_SharpJs_Overload_2(<DoublePoint>args[0]); return; }
      else if (args.length == 1 && SharpJsHelpers.TestTypeCheck(args[0], IntPoint)) { this.constructor_SharpJs_Overload_3(<IntPoint>args[0]); return; }
      throw new Error('SharpJS: Failed to match method overload. This can be due to differences in C#/JS type system.');
   }
   
   public zzz__sharpjs_clone() : DoublePoint {
      let res = new DoublePoint();
      res.X = SharpJsHelpers.valueClone(this.X);
      res.Y = SharpJsHelpers.valueClone(this.Y);
      return res;
   }
   public static default() : DoublePoint {
      return new DoublePoint();
   }
}

export class Int128 {
   private hi : number = 0;
   private lo : number = 0;
   
   public constructor_SharpJs_Overload_0() { }
   
   public constructor_SharpJs_Overload_1(_lo : number) {
      this.lo = SharpJsHelpers.valueClone(<number>_lo);
      if (_lo < 0) this.hi = SharpJsHelpers.valueClone(-1);
      else this.hi = SharpJsHelpers.valueClone(0);
   }
   
   public constructor_SharpJs_Overload_2(_hi : number, _lo : number) {
      this.lo = SharpJsHelpers.valueClone(_lo);
      this.hi = SharpJsHelpers.valueClone(_hi);
   }
   
   public constructor_SharpJs_Overload_3(val : Int128) {
      this.hi = SharpJsHelpers.valueClone(val.hi);
      this.lo = SharpJsHelpers.valueClone(val.lo);
   }
   
   public constructor();
   public constructor(_lo : number);
   public constructor(_hi : number, _lo : number);
   public constructor(val : Int128);
   public constructor(...args: any[]) {
      if (args.length == 0) { this.constructor_SharpJs_Overload_0(); return; }
      else if (args.length == 1 && SharpJsHelpers.TestTypeCheck(args[0], 'number')) { this.constructor_SharpJs_Overload_1(<number>args[0]); return; }
      else if (args.length == 2 && SharpJsHelpers.TestTypeCheck(args[0], 'number') && SharpJsHelpers.TestTypeCheck(args[1], 'number')) { this.constructor_SharpJs_Overload_2(<number>args[0], <number>args[1]); return; }
      else if (args.length == 1 && SharpJsHelpers.TestTypeCheck(args[0], Int128)) { this.constructor_SharpJs_Overload_3(<Int128>args[0]); return; }
      throw new Error('SharpJS: Failed to match method overload. This can be due to differences in C#/JS type system.');
   }
   
   public IsNegative() : boolean {
      return this.hi < 0;
   }
   
   public Equals(obj : {}) : boolean {
      if (obj === null || !(obj instanceof Int128)) return false;
      let i128 : Int128 = <Int128>obj;
      return (i128.hi === this.hi && i128.lo === this.lo);
   }
   
   public static Int128Mul(lhs : number, rhs : number) : Int128 {
      let negate : boolean = (lhs < 0) !== (rhs < 0);
      if (lhs < 0) lhs = SharpJsHelpers.valueClone(-lhs);
      if (rhs < 0) rhs = SharpJsHelpers.valueClone(-rhs);
      let int1Hi : number = <number>lhs >> 32;
      let int1Lo : number = <number>lhs & 0xFFFFFFFF;
      let int2Hi : number = <number>rhs >> 32;
      let int2Lo : number = <number>rhs & 0xFFFFFFFF;
      let a : number = int1Hi * int2Hi;
      let b : number = int1Lo * int2Lo;
      let c : number = int1Hi * int2Lo + int1Lo * int2Hi;
      let lo : number = 0;
      let hi : number = 0;
      hi = SharpJsHelpers.valueClone(<number>(a + (c >> 32)));
      {
         lo = SharpJsHelpers.valueClone((c << 32) + b);
      }
      if (lo < b) hi++;
      let result : Int128 = new Int128(hi, lo);
      return negate ? result.opNegate() : result;
   }
   
   public static opEquals(val1 : Int128, val2 : Int128) : boolean {
      if (<{}>val1 === <{}>val2) return true;
      else if (<{}>val1 === null || <{}>val2 === null) return false;
      return (val1.hi === val2.hi && val1.lo === val2.lo);
   }
   
   public opEquals(operand1 : Int128) : boolean { return Int128.opEquals(this, operand1); }
   
   public static opNotEquals(val1 : Int128, val2 : Int128) : boolean {
      return !(SharpJsHelpers.tryBinaryOperator(val1, val2, 'opEquals', (a, b) => a == b));
   }
   
   public opNotEquals(operand1 : Int128) : boolean { return Int128.opNotEquals(this, operand1); }
   
   public static opNegate(val : Int128) : Int128 {
      if (val.lo === 0) return new Int128(-val.hi, 0);
      else return new Int128(~val.hi, ~val.lo + 1);
   }
   
   public opNegate() : Int128 { return Int128.opNegate(this); }
   
   public zzz__sharpjs_clone() : Int128 {
      let res = new Int128();
      res.hi = SharpJsHelpers.valueClone(this.hi);
      res.lo = SharpJsHelpers.valueClone(this.lo);
      return res;
   }
   public static default() : Int128 {
      return new Int128();
   }
}

export class IntPoint {
   public X : number = 0;
   public Y : number = 0;
   
   public constructor_SharpJs_Overload_0() { }
   
   public constructor_SharpJs_Overload_1(X : number, Y : number) {
      this.X = SharpJsHelpers.valueClone(X);
      this.Y = SharpJsHelpers.valueClone(Y);
   }
   
   public constructor_SharpJs_Overload_2(x : number, y : number) {
      this.X = SharpJsHelpers.valueClone(<number>x);
      this.Y = SharpJsHelpers.valueClone(<number>y);
   }
   
   public constructor_SharpJs_Overload_3(pt : IntPoint) {
      this.X = SharpJsHelpers.valueClone(pt.X);
      this.Y = SharpJsHelpers.valueClone(pt.Y);
   }
   
   public constructor();
   public constructor(X : number, Y : number);
   public constructor(x : number, y : number);
   public constructor(pt : IntPoint);
   public constructor(...args: any[]) {
      if (args.length == 0) { this.constructor_SharpJs_Overload_0(); return; }
      else if (args.length == 2 && SharpJsHelpers.TestTypeCheck(args[0], 'number') && SharpJsHelpers.TestTypeCheck(args[1], 'number')) { this.constructor_SharpJs_Overload_1(<number>args[0], <number>args[1]); return; }
      else if (args.length == 2 && SharpJsHelpers.TestTypeCheck(args[0], 'number') && SharpJsHelpers.TestTypeCheck(args[1], 'number')) { this.constructor_SharpJs_Overload_2(<number>args[0], <number>args[1]); return; }
      else if (args.length == 1 && SharpJsHelpers.TestTypeCheck(args[0], IntPoint)) { this.constructor_SharpJs_Overload_3(<IntPoint>args[0]); return; }
      throw new Error('SharpJS: Failed to match method overload. This can be due to differences in C#/JS type system.');
   }
   
   public Equals(obj : {}) : boolean {
      if (obj === null) return false;
      if (obj instanceof IntPoint) {
         let a : IntPoint = <IntPoint>obj;
         return (this.X === a.X) && (this.Y === a.Y);
      }
      else return false;
   }
   
   public static opEquals(a : IntPoint, b : IntPoint) : boolean {
      return a.X === b.X && a.Y === b.Y;
   }
   
   public opEquals(operand1 : IntPoint) : boolean { return IntPoint.opEquals(this, operand1); }
   
   public static opNotEquals(a : IntPoint, b : IntPoint) : boolean {
      return a.X !== b.X || a.Y !== b.Y;
   }
   
   public opNotEquals(operand1 : IntPoint) : boolean { return IntPoint.opNotEquals(this, operand1); }
   
   public zzz__sharpjs_clone() : IntPoint {
      let res = new IntPoint();
      res.X = SharpJsHelpers.valueClone(this.X);
      res.Y = SharpJsHelpers.valueClone(this.Y);
      return res;
   }
   public static default() : IntPoint {
      return new IntPoint();
   }
}

export class IntRect {
   public left : number = 0;
   public top : number = 0;
   public right : number = 0;
   public bottom : number = 0;
   
   public constructor_SharpJs_Overload_0() { }
   
   public constructor_SharpJs_Overload_1(l : number, t : number, r : number, b : number) {
      this.left = SharpJsHelpers.valueClone(l);
      this.top = SharpJsHelpers.valueClone(t);
      this.right = SharpJsHelpers.valueClone(r);
      this.bottom = SharpJsHelpers.valueClone(b);
   }
   
   public constructor_SharpJs_Overload_2(ir : IntRect) {
      this.left = SharpJsHelpers.valueClone(ir.left);
      this.top = SharpJsHelpers.valueClone(ir.top);
      this.right = SharpJsHelpers.valueClone(ir.right);
      this.bottom = SharpJsHelpers.valueClone(ir.bottom);
   }
   
   public constructor();
   public constructor(l : number, t : number, r : number, b : number);
   public constructor(ir : IntRect);
   public constructor(...args: any[]) {
      if (args.length == 0) { this.constructor_SharpJs_Overload_0(); return; }
      else if (args.length == 4 && SharpJsHelpers.TestTypeCheck(args[0], 'number') && SharpJsHelpers.TestTypeCheck(args[1], 'number') && SharpJsHelpers.TestTypeCheck(args[2], 'number') && SharpJsHelpers.TestTypeCheck(args[3], 'number')) { this.constructor_SharpJs_Overload_1(<number>args[0], <number>args[1], <number>args[2], <number>args[3]); return; }
      else if (args.length == 1 && SharpJsHelpers.TestTypeCheck(args[0], IntRect)) { this.constructor_SharpJs_Overload_2(<IntRect>args[0]); return; }
      throw new Error('SharpJS: Failed to match method overload. This can be due to differences in C#/JS type system.');
   }
   
   public zzz__sharpjs_clone() : IntRect {
      let res = new IntRect();
      res.left = SharpJsHelpers.valueClone(this.left);
      res.top = SharpJsHelpers.valueClone(this.top);
      res.right = SharpJsHelpers.valueClone(this.right);
      res.bottom = SharpJsHelpers.valueClone(this.bottom);
      return res;
   }
   public static default() : IntRect {
      return new IntRect();
   }
}

export enum ClipType {
   ctIntersection, 
   ctUnion, 
   ctDifference, 
   ctXor
}

export enum PolyType {
   ptSubject, 
   ptClip
}

export enum PolyFillType {
   pftEvenOdd, 
   pftNonZero, 
   pftPositive, 
   pftNegative
}

export enum JoinType {
   jtSquare, 
   jtRound, 
   jtMiter
}

export enum EndType {
   etClosedPolygon, 
   etClosedLine, 
   etOpenButt, 
   etOpenSquare, 
   etOpenRound
}

export enum EdgeSide {
   esLeft, 
   esRight
}

export enum Direction {
   dRightToLeft, 
   dLeftToRight
}

