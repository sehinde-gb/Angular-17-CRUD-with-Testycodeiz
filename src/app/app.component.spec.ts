import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it(`should have the 'crudv17' title`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    expect(fixture.componentInstance.title).toEqual('crudv17');
  });

  it('should render header content', () => {
  const fixture = TestBed.createComponent(AppComponent);
  fixture.detectChanges();

  const compiled = fixture.nativeElement as HTMLElement;
  const titleEl = compiled.querySelector('[data-test="app-title"]');

  expect(titleEl?.textContent).toContain('Angular 17 CRUD');
});
});