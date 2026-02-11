import { HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { GlobalLoadingService } from "../../services/global-loading.service";
import { finalize } from "rxjs";


export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
    const loadingService = inject(GlobalLoadingService);
    
    // Shows the loading service
    loadingService.show();
   
    // When the finalize function is called it means the stream is closing and it will hide the loading service
    // This means no posts etc will be shown in the local state component.
    return next(req).pipe(
      finalize(() => loadingService.hide())
    );
}
