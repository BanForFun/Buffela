import {Printer} from "@buffela/tools-common";
import {Schema} from "@buffela/parser";

declare global {
    let schema: Schema;
    let printer: Printer;
    let options: {
        serializerEnabled: boolean;
        deserializerEnabled: boolean;
    }
}