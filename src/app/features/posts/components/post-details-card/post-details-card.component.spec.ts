import { TestBed } from '@angular/core/testing';
import { PostDetailsCardComponent } from './post-details-card.component';
import { Post } from '../../models/post';

describe('PostDetailsCardComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostDetailsCardComponent],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(PostDetailsCardComponent);

    const mockPost: Post = {
      id: 1,
      title: 'Test title',
      body: 'Test body',
    };

    fixture.componentInstance.post = mockPost;

    fixture.detectChanges();

    expect(fixture.componentInstance).toBeTruthy();
  });
});