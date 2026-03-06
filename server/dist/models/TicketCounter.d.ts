import { Model } from 'mongoose';
interface ITicketCounter {
    _id: string;
    sequence: number;
}
interface ITicketCounterModel extends Model<ITicketCounter> {
    getNextSequence(): Promise<string>;
}
declare const _default: ITicketCounterModel;
export default _default;
//# sourceMappingURL=TicketCounter.d.ts.map