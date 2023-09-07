import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { faker } from '@faker-js/faker';
import {
  RxapAuthenticationService,
  RxapUserProfileService,
} from '@rxap/authentication';
import { IconModule } from '@rxap/icon';
import { BehaviorSubject } from 'rxjs';
import { UserProfileIconComponent } from './user-profile-icon.component';

describe(UserProfileIconComponent.name, () => {

  const profile = {
    username: faker.internet.email(),
  };
  const userProfileService = {
    getProfile() {
      return Promise.resolve(profile);
    },
  };
  const authenticationService = {
    isAuthenticated$: new BehaviorSubject(true),
    signOut() {
      return Promise.resolve();
    },
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        IconModule,
        NoopAnimationsModule,
      ],
      providers: [
        {
          provide: RxapUserProfileService,
          useValue: userProfileService,
        },
        {
          provide: RxapAuthenticationService,
          useValue: authenticationService,
        },
      ],
    });
    TestBed.overrideComponent(UserProfileIconComponent, {
      add: {
        imports: [],
        providers: [],
      },
    });
  });

  it('renders', () => {
    cy.mount(UserProfileIconComponent);
  });

  it('long username', () => {
    profile.username = faker.lorem.words(5).replace(/\s/g, '');
    cy.mount(UserProfileIconComponent).then(response => {
      response.fixture.whenStable().then(() => {
        cy.get('button').click();
      });
    });
  });

});
