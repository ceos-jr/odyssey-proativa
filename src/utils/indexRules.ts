type Validation<T> = (...args: T[]) => boolean;
type GetValid<T, R extends NonNullable<any>> = (...args: T[]) => R | null;
type SafeGetValid<T, R extends NonNullable<any>> = (...args: T[]) => R;
interface PositionData {
  prev: number; // -1 -> invalido
  id: string;
  onOrigin: boolean;
  next: number; // -1 -> invalido
}
type Handler<T> = (...args: T[]) => void;
type Optional<T extends NonNullable<any>> = T | null;

interface IndexRules {
  lengthToIndexDiff: number; // numero de elementos ativos
  data: Array<PositionData>;
  trash: Array<PositionData>;

  lastIndexUp: number;

  removeValidate: Validation<number>;
  handleRemove: Validation<number>;

  getLengthSum: SafeGetValid<undefined, number>;
  lengthValidate: Validation<number>;
  minLength: number;
  maxLength: number;

  getLastIndex: GetValid<undefined, number>;
  minIndex: number;
  maxIndex: number;
  indexValidate: Validation<number>;

  handleAppend: Validation<number>;
  getAppendIndex: GetValid<undefined, number>;

  getLoopMove: GetValid<number, number>;
}

const createIndexRules = (
  array: Array<any>,
  onCreate: boolean,
  opt: {
    maxLength: number;
    minLength: number;
    lengthToIndexDiff: number;
  }
): IndexRules => {
  const rules: IndexRules = {
    minLength: opt.minLength,
    maxLength: opt.maxLength,
    lengthToIndexDiff: opt.lengthToIndexDiff,
    minIndex: opt.minLength + opt.lengthToIndexDiff,
    maxIndex: opt.maxLength + opt.lengthToIndexDiff,
    // length: array.length, // tamanho considerando todos os elementos, (apagados, criados e )
    lastIndexUp: array.length - 1,

    trash: [],
    data: array.map((f, i) => {
      return {
        prev: array[i - 1] || array[i - 1] === 0 ? i - 1 : -1,
        onOrigin: !onCreate ? true : false,
        id: f.id ?? i.toString(),
        next: array[i + 1] || array[i + 1] === 0 ? i + 1 : -1,
      };
    }),

    getLengthSum: function () {
      return this.data.length + this.trash.length;
    },

    removeValidate: function (index: number) {
      const posData = this.data[index];

      const catchInvalidInput = posData === null;
      const catchInvalidIndex = !this.indexValidate(index);
      const catchLengthBelowMin = this.getLengthSum() - 1 < this.minLength;

      return !(catchLengthBelowMin || catchInvalidIndex || catchInvalidInput);
    },

    handleRemove: function (index: number) {
      const validRemove = this.removeValidate(index);
      const auxData = this.data[index];

      if (auxData && validRemove) {
        const prevIndex = auxData.prev;
        const nextIndex = auxData.next;

        this.data = this.data.filter((v) => !(v.id === auxData.id));

        const indexData = this.data[index];
        const prevData = this.data[prevIndex];
        const nextData = this.data[nextIndex];

        if (auxData.onOrigin && indexData) {
          indexData.onOrigin = false;
          this.trash.push(indexData);
        }

        if (prevIndex != null && prevData) {
          prevData.next = nextIndex;
        }

        if (nextIndex != null && nextData) {
          nextData.prev = prevIndex;
        }

        return true;
      } else {
        return false;
      }
    },

    lengthValidate: function (length: number) {
      return length >= this.minLength && length <= this.maxLength;
    },

    indexValidate: function (index: number) {
      return (
        index >= this.minIndex &&
        index <= this.maxIndex &&
        this.lastIndexUp != null &&
        index <= this.lastIndexUp
      );
    },

    getLastIndex: function () {
      return this.lastIndexUp;
    },

    handleAppend: function () {
      const newLength = this.getLengthSum() + 1;
      return this.lengthValidate(newLength);
    },

    getAppendIndex: function () {
      const validAppend = this.lengthValidate(this.data.length);
      const currentLastIndex = this.data.length + this.trash.length - 1;
      const newLastIndex = this.data.length + this.trash.length;

      const currentLastData = this.data[currentLastIndex];

      if (validAppend && currentLastData) {
        currentLastData.next = newLastIndex;

        this.data.push({
          prev: currentLastData ? currentLastIndex : -1,
          onOrigin: false,
          id: newLastIndex.toString(),
          next: -1,
        });

        return newLastIndex;
      } else {
        return -1;
      }
    },

    getLoopMove: function (from: number, to: number) {
      const lastIndex = this.lastIndexUp;
      if (!lastIndex) {
        return null;
      }

      const diff = to - from;
      const [start, end] = [this.minIndex, lastIndex];
      const loopNorm =
        diff %
        (end - start); /* Percea que end - start representa umm distancia,
         ou seja é análogo a length e para loopNorm virar um index ele deve receber "+ this.lengthToIndexDiff" */
      const loopSignal = diff > 0 ? 1 : 0; // Ou seja diff > 0 ? (loop p/ inicio) : (loop p/ fim)

      const loopTo =
        (loopSignal ? start + loopNorm : end - loopNorm) +
        this.lengthToIndexDiff;
      return diff != 0
        ? this.indexValidate(from, lastIndex)
          ? this.indexValidate(to, lastIndex) == true
            ? to
            : loopTo
          : null
        : null;

      /** 
         * Ideia geral: 
            - Para fazer um loop queremos um ciclo, e para fazer um ciclo usamos modulos:
              - Exemplo de ciclo com modulos:
                - Ciclo[k] = k%5 (resto da divisão por 5) 
                - Ciclo = [0 1 2 3 4 0 1 2 3 4 ...], onde (0 1 2 3 4) se repete pelo infinito. 
         */
    },
  };

  return rules;
};

export default createIndexRules;
