import { createGateway } from '@/common/factories/create-gateway.factory';

export class <%= classify(moduleName) %>Gateway extends createGateway('<%= dasherize(moduleName) %>') {
    // Gateway methods will be defined here

}