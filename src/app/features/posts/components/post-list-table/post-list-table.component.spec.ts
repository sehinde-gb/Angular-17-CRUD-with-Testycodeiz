import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { PostListTableComponent } from './post-list-table.component';
import { Post } from '../../models/post';
import { By } from '@angular/platform-browser';


describe('PostListTableComponent', () => {
  // Test variables
  let component: PostListTableComponent;
  let fixture: ComponentFixture<PostListTableComponent>;

  const postsMock: Post[] = [
    { id: 1, title: 'A', body: 'B' } as Post,
    { id: 2, title: 'C', body: 'D' } as Post,
  ];
  // TestBed setup runs before each test
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

  /*
    Success path
    Test that verify normal user behaviour works
  */


  it('emits deletePost with the post id when delete button clicked', () => {
    // Arrange
    component.posts = [{ id: 1, title: 'A', body: 'B' } as any];

    // Act
    fixture.detectChanges();

    spyOn(component.deletePost, 'emit');

    const deleteBtn = fixture.debugElement.query(By.css('button.btn-danger'));
    deleteBtn.nativeElement.click();

    // Assert
    expect(component.deletePost.emit).toHaveBeenCalledWith(1);
  });

  it('emits deletePost with the correct id when delete is clicked', () => {
    // Arrange
    component.posts = [
      { id: 1, title: 'A', body: 'B' } as any,
      { id: 2, title: 'C', body: 'D' } as any,
    ];
    spyOn(component.deletePost, 'emit');

    // Act
    fixture.detectChanges();

    const rows = fixture.debugElement.queryAll(By.css('tbody tr'));
    const secondRowDeleteBtn = rows[1].query(By.css('button.btn-danger'));
    secondRowDeleteBtn.nativeElement.click();

    // Assert
    expect(component.deletePost.emit).toHaveBeenCalledWith(2);
  });

  /*
    Error path
    Tests that verify error handling behaviour
  */


  /*
    Edge case
    Tests that verify prevention or unusual situations
  */
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



  /*
    Render / UI state
    Tests that verify the component renders correctly
    without user interaction
  */

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

  it('renders rows per post', () => {
    // Arrange
    component.posts = postsMock;

    // Act
    fixture.detectChanges();

    // Assert (only data rows in tBody)
    const rows = fixture.debugElement.queryAll(By.css('tbody tr'));

    expect(fixture.nativeElement.textContent).not.toContain('No posts found');
    expect(rows.length).toBe(postsMock.length);

    expect(rows[0].nativeElement.textContent).toContain('1');
    expect(rows[0].nativeElement.textContent).toContain('A');
    expect(rows[0].nativeElement.textContent).toContain('B');

    expect(rows[1].nativeElement.textContent).toContain('2');
    expect(rows[1].nativeElement.textContent).toContain('C');
    expect(rows[1].nativeElement.textContent).toContain('D');
  });
});
