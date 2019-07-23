import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class AppService {

  constructor(private http: HttpClient) { }

  public ping(): Observable<any> {
    return this.http.get(`${environment.apiEndpoint}/ping`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Service error handler
   * @param error The error response
   */
  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      console.error(`${error.status}: ${error.message}`);
    }
    // return an observable with a user-facing error message
    return throwError('We\'re sorry an unexpected error occurred.');
  }
}
