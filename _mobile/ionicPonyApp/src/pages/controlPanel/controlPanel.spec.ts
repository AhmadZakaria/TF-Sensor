import { ComponentFixture, async } from '@angular/core/testing';
import { TestUtils } from '../../test';
import { ControlPanel } from './controlPanel';

let fixture: ComponentFixture<ControlPanel> = null;
let instance: any = null;

describe('Pages: HelloIonic', () => {

    beforeEach(async(() => TestUtils.beforeEachCompiler([ControlPanel]).then(compiled => {
        fixture = compiled.fixture;
        instance = compiled.instance;
    })));

    it('should create the hello ionic page', async(() => {
        expect(instance).toBeTruthy();
    }));
});
