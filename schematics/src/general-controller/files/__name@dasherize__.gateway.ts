import { createGateway } from '@/common/factories/create-gateway.factory';

// filepath: /home/dowinn/Desktop/System/neststarter/schematics/src/general-controller/files/__name@dasherize__.gateway.ts

export class <%= classify(moduleName) %>Gateway extends createGateway('<%= dasherize(moduleName) %>') {
    // Gateway methods will be defined here

}