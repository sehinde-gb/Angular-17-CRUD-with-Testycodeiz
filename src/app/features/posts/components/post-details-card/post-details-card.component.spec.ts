import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostDetailsCardComponent } from './post-details-card.component';

describe('PostDetailsCardComponent', () => {
  let component: PostDetailsCardComponent;
  let fixture: ComponentFixture<PostDetailsCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostDetailsCardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PostDetailsCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
