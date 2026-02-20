import {Printer} from "@buffela/tools-common";
import {Extensions, Schema} from "@buffela/parser";

declare global {
    let schema: Schema<Extensions, Extensions>;
    let printer: Printer;
    let options: {
        serializerEnabled: boolean;
        deserializerEnabled: boolean;
    }
}