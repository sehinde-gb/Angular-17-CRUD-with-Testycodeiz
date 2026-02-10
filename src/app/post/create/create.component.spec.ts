import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreateComponent } from './create.component';
import { PostService } from '../../services/post.service';
import { Router } from '@angular/router';
import { GlobalLoadingService } from '../../services/global-loading.service';
import { ToastService } from '../../services/toast.service';
import { ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';

describe('CreateComponent', () => {
  let component: CreateComponent;
  let fixture: ComponentFixture<CreateComponent>;

  // 1. Create Spies for ALL injected services
  let postServiceSpy: jasmine.SpyObj<PostService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let toastSpy: jasmine.SpyObj<ToastService>;
  let loadingSpy: jasmine.SpyObj<GlobalLoadingService>;

  beforeEach(async () => {
    // 2. Initialize the spies
    postServiceSpy = jasmine.createSpyObj('PostService', ['create']);
    routerSpy = jasmine.createSpyObj('Router', ['navigateByUrl']);
    toastSpy = jasmine.createSpyObj('ToastService', ['showSuccess']);
    loadingSpy = jasmine.createSpyObj('GlobalLoadingService', ['isLoading']);

    await TestBed.configureTestingModule({
      imports: [CreateComponent, ReactiveFormsModule],
      providers: [
        // 3. This maps the inject(Service) calls to our spies
        { provide: PostService, useValue: postServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ToastService, useValue: toastSpy },
        { provide: GlobalLoadingService, useValue: loadingSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // This triggers ngOnInit()
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate back to index on successful submit', () => {
    // Arrange
    const mockPostData = { title: 'Test Title', body: 'Test Body' };
    postServiceSpy.create.and.returnValue(of({ id: 1, ...mockPostData }));

    // Act
    component.form.setValue(mockPostData);
    component.submit();

    // Assert
    expect(postServiceSpy.create).toHaveBeenCalled();
    expect(toastSpy.showSuccess).toHaveBeenCalledWith('Post created successfully');
    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('post/index');
  });

  it('should show confirm dialog when clicking goBack with a dirty form', () => {
    // Arrange: Mock the browser confirm dialog
    spyOn(window, 'confirm').and.returnValue(true);
    component.form.markAsDirty();

    // Act
    component.goBack();

    // Assert
    expect(window.confirm).toHaveBeenCalled();
    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/post/index');
  });
});