import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { PostListTableComponent } from './post-list-table.component';
import { Post } from '../../models/post';
import { By } from '@angular/platform-browser';


describe('PostListTableComponent', () => {
  let component: PostListTableComponent;
  let fixture: ComponentFixture<PostListTableComponent>;

  const postsMock: Post[] = [
    { id: 1, title: 'A', body: 'B' } as Post,
    { id: 2, title: 'C', body: 'D' } as Post,
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostListTableComponent],
      // needed because template uses Routerlink
      providers: [provideRouter([])],
    })
    .compileComponents();

    fixture = TestBed.createComponent(PostListTableComponent);
    component = fixture.componentInstance;

  });


  it('renders rows per post', () => {
    // Arrange
    component.posts = postsMock;

    // Act
    fixture.detectChanges();

    // Assert (only data rows in tBody)
    const rows = fixture.debugElement.queryAll(By.css('tbody tr'));
    //expect(rows.length).toBe(2);
    expect(fixture.nativeElement.textContent).not.toContain('No posts found');
    expect(rows.length).toBe(postsMock.length);

    expect(rows[0].nativeElement.textContent).toContain('1');
    expect(rows[0].nativeElement.textContent).toContain('A');
    expect(rows[0].nativeElement.textContent).toContain('B');

    expect(rows[1].nativeElement.textContent).toContain('2');
    expect(rows[1].nativeElement.textContent).toContain('C');
    expect(rows[1].nativeElement.textContent).toContain('D');
  });

  it('shows "No posts found" when posts is empty', () => {

    // Arrange
    component.posts = [];

    // Act
    fixture.detectChanges();

    // Assert
    expect(fixture.nativeElement.textContent).toContain('No posts found');

    // Optional: ensure no action buttons exist in empty state
    const buttons = fixture.debugElement.queryAll(By.css('button.btn-danger'));
    expect(buttons.length).toBe(0);
  });

  it('emits deletePost with the post id when delete button clicked', () => {
    component.posts = [{ id: 1, title: 'A', body: 'B' } as any];
    fixture.detectChanges();

    spyOn(component.deletePost, 'emit');

    const deleteBtn = fixture.debugElement.query(By.css('button.btn-danger'));
    deleteBtn.nativeElement.click();

    expect(component.deletePost.emit).toHaveBeenCalledWith(1);
  });

  it('emits deletePost with the correct id when delete is clicked', () => {
    component.posts = [
      { id: 1, title: 'A', body: 'B' } as any,
      { id: 2, title: 'C', body: 'D' } as any,
    ];

    spyOn(component.deletePost, 'emit');
    fixture.detectChanges();

    const rows = fixture.debugElement.queryAll(By.css('tbody tr'));
    const secondRowDeleteBtn = rows[1].query(By.css('button.btn-danger'));
    secondRowDeleteBtn.nativeElement.click();

    expect(component.deletePost.emit).toHaveBeenCalledWith(2);
  });

  it('renders correct hrefs for View and Edit links', async () => {
    // Arrange
    component.posts = [{ id: 1, title: 'A', body: 'B' } as any];

     // Act
    fixture.detectChanges();
    await fixture.whenStable();

    const firstRow = fixture.debugElement.queryAll(By.css('tbody tr'))[0];

    const viewA: HTMLAnchorElement = firstRow.query(By.css('a.btn.btn-info')).nativeElement;
    const editA: HTMLAnchorElement = firstRow.query(By.css('a.btn.btn-primary')).nativeElement;

    // Assert
    // JSDOM/Karma will usually render absolute URLs like http://localhost:9876/...
    expect(viewA.getAttribute('href')).toContain('/post/1/view');
    expect(editA.getAttribute('href')).toContain('/post/1/edit');
  });


});
