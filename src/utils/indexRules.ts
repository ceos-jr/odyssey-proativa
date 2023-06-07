type Validation<T> = (...args: T[]) => boolean;
type GetValid<T, R extends NonNullable<any>> = (...args: T[]) => R | null;
type SafeGetValid<T, R extends NonNullable<any>> = (...args: T[]) => R;
type Optional<T extends NonNullable<any>> = T | null;

interface IndexRules {
  minLength: number;
  maxLength: number;
  lengthToIndexDiff: number;
  minIndex: number;
  maxIndex: number;
  array: Array<any>;
  calcIndexFromLength: SafeGetValid<number, number>;
  getLastIndex: GetValid<number, number>;
  lengthValidate: Validation<number>;
  indexValidate: Validation<number>;
  append: Validation<number>;
  getAppendIndex: GetValid<undefined,number>;
  shitfAfterRemove: GetValid<number, number[]>;
  move: Validation<number>;
  getCircularMove: GetValid<number, number>;
  getValidSwap: GetValid<[number, number], [number, number]>;
}

const createIndexRules = 
  (array: Array<any>, 
    opt: {
      maxLength: number,
      minLength:number,
      lengthToIndexDiff: number
    } 
  ): IndexRules => {
    const rules: IndexRules = {
      minLength: opt.minLength,
      maxLength: opt.maxLength,
      lengthToIndexDiff: opt.lengthToIndexDiff,
      minIndex: opt.minLength + opt.lengthToIndexDiff,
      maxIndex: opt.maxLength + opt.lengthToIndexDiff,
      array: array,

      lengthValidate: function (length: number) {
        return length >= this.minLength && length <= this.maxLength;
      },

      indexValidate: function (index: number, rawLastIndex?: number) {
        const lastIndex = rawLastIndex ?? (array.length + this.lengthToIndexDiff); 
        return index >= this.minIndex && index <= this.maxIndex && index <= lastIndex;
      },

      calcIndexFromLength: function (length: number) {
        return length + this.lengthToIndexDiff;
      },

      getLastIndex: function () {
        const rawLastIndex = this.calcIndexFromLength(this.array.length); 

        return this.indexValidate(rawLastIndex, rawLastIndex) ? rawLastIndex : null;
      },

      append: function () {
        const newLength = this.array.length + 1;
        return this.lengthValidate(newLength);
      },

      getAppendIndex: function () {
        const newLength = this.array.length + 1;
        const index = this.calcIndexFromLength(newLength);
        console.log(index);
        return (this.lengthValidate(newLength)) ? index : null;
      },

      shitfAfterRemove: function (index: number) {
        const next = index + 1;
        const lastIndex = this.getLastIndex() ?? undefined;
        if (lastIndex || !this.indexValidate(next, lastIndex!) || !lastIndex) {
          return null;
        } else {
          const shitfAfter: number[] = [];
          let loopNext = next + 1;
          console.log(loopNext);

          while (this.indexValidate(loopNext, lastIndex)) {
            shitfAfter.push(loopNext);
            loopNext = loopNext + 1;
          }
  
          return shitfAfter;
        }
      },

      move: function (from: number, to: number) {
        return this.indexValidate(from) && this.indexValidate(to);
      },

      getCircularMove: function(from: number, to: number) {
        const lastIndex = this.getLastIndex();
        const diff = to - from;
        const [start, end] = [this.minIndex, lastIndex];
        const loopToEnd = (diff)%(end-start) + start; // to < start  
        const loopToStart = (diff)%(end-start) + start; // S

        const loopTo = to > 0 ? loopToStart : loopToEnd;

        return lastIndex != null & diff != 0 ? (
          this.indexValidate(from, lastIndex) ? (
            this.indexValidate(to, lastIndex) == true ? (to) : (loopTo)
          ) : null
        ) : null;

        /* 
          "->" = +1 (mover para frente é o mesmo que adicionar 1)
          "->" = -1 (mover para trás é o mesmo que remover 1)
          (start-1)-a-b-c-d-(end+1) = formato da lista, 
          index[x] é o index do elemento x, sendo x = a,b,c,d,...

          Movimente padrão:
            - next = x + i, 
            - x e next trocam seus valores assim:
              - aux = index[x],
              - index[x] = index[next]
              - index[next] = index[aux]

          Mas quando chegamos nos limites não seguimos essa logica:
            - movimento (next = d+1) em [(start-1)-a-b-c-d-(end+1)]
              - d+1 vai para end+1, para impedir isso fazemos um loop:
              - (start-1)-d-a-b-c-(end+1)
              - Nesse caso ao invés de index[d] e index[next] simplesmente
                trocarem seus valores, ocorre uma mundaça geral.
                - index[d] = index[a], index[c] = index[d], index[b] = index[c], index[a] = index[b]

            - movimento (next = a-1) em [(start-1)-a-b-c-d-(end+1)]
              - a+1 vai para start-1, para impedir isso fazemos um loop:
              - (start-1)-b-c-d-a-(end+1)
              - Nesse caso ao invés de index[a] e index[next] simplesmente
                trocarem seus valores, ocorre uma mundaça geral.
                - index[a] = index[d], index[d] = index[c], index[c] = index[b], index[b] = index[a]

            - Generalizando para o formato: (start-1)-v-...-w-...-u-(end+1)
              - w+k: *k é um valor genérico tal que w+k > u 
                - l = u-v é o número de posições disponíveis
                - next = (k mod l) + v 
                - index[w+k] = index[next]
        */
      },

      getValidSwap: function (tupleIndex: [number, number]) {
        const [u, v] = tupleIndex;

        if (this.indexValidate(u) && this.indexValidate(v)) {
          return [v, u];
        } else {
          return null;
        }
      }
    };
  return rules;
  };

export default createIndexRules;